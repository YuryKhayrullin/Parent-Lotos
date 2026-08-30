<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\ClientService;
use App\Services\Sms\SmsServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AuthController extends Controller
{
    protected ClientService $clientService;
    protected SmsServiceInterface $smsService;

    public function __construct(ClientService $clientService, SmsServiceInterface $smsService)
    {
        $this->clientService = $clientService;
        $this->smsService = $smsService;
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

        if (app()->environment('local', 'testing')) {
            Cache::put("otp_{$phone}", '1111', now()->addMinutes(10));
            return response()->json([
                'success' => true,
                'message' => 'Code sent',
                'code' => '1111'
            ], 200);
        }

        RateLimiter::hit("otp-{$phone}", 1); 

        if (RateLimiter::tooManyAttempts("otp-{$phone}", 5)) {
            $seconds = RateLimiter::availableIn("otp-{$phone}");
            throw ValidationException::withMessages([
                'phone' => 'Too many requests. Please try again in ' . $seconds . ' seconds.',
            ]);
        }

        try {
            $this->clientService->syncParentWithChildren($phone);
            
            $otp = (string) rand(1000, 9999);
            Cache::put("otp_{$phone}", $otp, now()->addMinutes(5));
            
            $this->smsService->send($phone, "Your OTP code is: {$otp}");
            
            return response()->json([
                'message' => 'OTP sent successfully'
            ]);
        } catch (\Throwable $e) {
            Log::error("OTP request failed: {$e->getMessage()}");
            return response()->json([
                'message' => 'Error communicating with service'
            ], 500);
        }
    }
public function verifyOtp(Request $request)
{
    $request->validate([
        'phone' => 'required|string|regex:/^\+?[1-9]\d{1,14}$/',
        'otp' => 'required|string|regex:/^\d{4,6}$/',
    ]);

    $phone = preg_replace('/[^0-9]/', '', $request->phone);
    if (strlen($phone) === 10) {
        $phone = '7' . $phone;
    } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '8') {
        $phone = '7' . substr($phone, 1);
    }

    $otp = preg_replace('/[^0-9]/', '', $request->otp);

    $storedOtp = Cache::get("otp_{$phone}");

    $isMasterOtp = app()->environment('local', 'testing') && in_array($otp, ['1111', '111111']);

    if (!$isMasterOtp && (!$storedOtp || $storedOtp != $otp)) {
        RateLimiter::hit("otp-{$phone}", 1);
        throw ValidationException::withMessages([
            'otp' => 'Invalid OTP code',
        ]);
    }

    if (!$isMasterOtp) {
        Cache::forget("otp_{$phone}");
    }

    try {
        $parent = \App\Models\ParentProfile::where('phone', $phone)->first();
        if (!$parent) {
            $parent = \App\Models\ParentProfile::create([
                'phone' => $phone,
                'yclients_client_id' => rand(1000, 9999),
                'name' => 'Test Parent',
            ]);
        }

        $token = $parent->createToken('parent_lotos_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $parent,
        ], 200);
    } catch (\Throwable $e) {
        Log::error("OTP verification failed: {$e->getMessage()}");
        return response()->json([
            'message' => 'Error during verification'
        ], 500);
    }
}

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}