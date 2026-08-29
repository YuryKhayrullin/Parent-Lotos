<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function requestOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|regex:/^\+?[1-9]\d{1,14}$/',
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        if (strlen($phone) === 10) {
            $phone = '7' . $phone;
        } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
            $phone = '7' . substr($phone, 1);
        }

        // Simple rate limiting
        if (RateLimiter::tooManyAttempts("otp-{$phone}", 5)) {
            $seconds = RateLimiter::availableIn("otp-{$phone}");
            throw ValidationException::withMessages([
                'phone' => 'Too many requests. Please try again in ' . $seconds . ' seconds.',
            ]);
        }

        try {
            // Sync with YCLIENTS to ensure client exists
            $parent = $this->clientService->syncParentWithChildren($phone);
            
            // Generate and store OTP (simple 6-digit code)
            $otp = rand(100000, 999999);
            Cache::put("otp_{$phone}", $otp, 5); // 5 minutes expiry
            
            // In development, return OTP in response
            if (app()->environment('local', 'testing')) {
                return response()->json([
                    'message' => 'OTP sent successfully',
                    'otp' => $otp // Remove in production!
                ]);
            }
            
            // TODO: Send actual SMS via YCLIENTS/SMS.ru
            // $this->sendSms($phone, "Your OTP code is: {$otp}");
            
            RateLimiter::hit("otp-{$phone}", 1); // 1 minute window
            
            return response()->json([
                'message' => 'OTP sent successfully'
            ]);
        } catch (ClientNotFoundException $e) {
            return response()->json([
                'message' => 'Phone number not found in the system'
            ], 404);
        } catch (YclientsApiException $e) {
            return response()->json([
                'message' => 'Error communicating with YCLIENTS service'
            ], 502);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|regex:/^\+?[1-9]\d{1,14}$/',
            'otp' => 'required|string|digits:6',
        ]);

        $phone = preg_replace('/[^0-9]/', '', $request->phone);
        if (strlen($phone) === 10) {
            $phone = '7' . $phone;
        } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
            $phone = '7' . substr($phone, 1);
        }

        $storedOtp = Cache::get("otp_{$phone}");
        
        if (!$storedOtp || $storedOtp != $request->otp) {
            RateLimiter::hit("otp-{$phone}", 1);
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP code',
            ]);
        }

        // OTP is valid, clear it
        Cache::forget("otp_{$phone}");
        
        try {
            // Get or create user from YCLIENTS
            $parent = $this->clientService->syncParentWithChildren($phone);
            
            // Create personal access token (Sanctum)
            $token = $parent->createToken('parent_lotos_token')->plainTextToken;
            
            return response()->json([
                'user' => $parent,
                'token' => $token,
            ]);
        } catch (ClientNotFoundException $e) {
            return response()->json([
                'message' => 'Phone number not found in the system'
            ], 404);
        } catch (YclientsApiException $e) {
            return response()->json([
                'message' => 'Error communicating with YCLIENTS service'
            ], 502);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    protected function sendSms(string $phone, string $message): void
    {
        // TODO: Implement actual SMS sending via YCLIENTS or SMS.ru
        // For now, just log
        \Log::info("SMS to {$phone}: {$message}");
    }
}