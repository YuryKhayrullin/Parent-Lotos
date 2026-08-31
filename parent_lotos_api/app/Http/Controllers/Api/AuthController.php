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
            'phone' => 'required|string|regex:/^[\d\s\+\-\(\)]{10,20}$/',
        ]);

        $phone = $this->normalizePhone($request->phone);

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
            'phone' => 'required|string|regex:/^[\d\s\+\-\(\)]{10,20}$/',
            'otp' => 'required|string|regex:/^\d{4,6}$/',
        ]);

        $phone = $this->normalizePhone($request->phone);
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

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($digits) === 10) {
            return '7' . $digits;
        } elseif (strlen($digits) === 11 && str_starts_with($digits, '8')) {
            return '7' . substr($digits, 1);
        }
        return $digits;
    }

    public function magicLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $inviteToken = \App\Models\InviteToken::where('token', $request->token)
            ->where('used_at', null)
            ->where('expires_at', '>', now())
            ->first();

        if (!$inviteToken) {
            throw ValidationException::withMessages(['token' => 'Invalid or expired token']);
        }

        $inviteToken->update(['used_at' => now()]);
        $parent = $inviteToken->parent;

        $sanctumToken = $parent->createToken('parent_lotos_magic_token')->plainTextToken;

        return response()->json([
            'user' => $parent,
            'token' => $sanctumToken,
        ]);
    }

    public function unlock(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|regex:/^\d{4}$/',
        ]);

        if (!Hash::check($request->pin, $request->user()->pin_code)) {
            return response()->json(['message' => 'Неверный PIN-код'], 422);
        }

        return response()->json(['success' => true], 200);
    }

    public function setPin(Request $request)
    {
        $request->validate([
            'pin' => 'required|string|regex:/^\d{4}$/',
        ]);

        $request->user()->update([
            'pin_code' => Hash::make($request->pin),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'PIN set successfully',
            'user' => $request->user()
        ], 200);
    }

    public function pinLogin(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|regex:/^[\d\s\+\-\(\)]{10,20}$/',
            'pin' => 'required|string|regex:/^\d{4}$/',
        ]);

        $phone = $this->normalizePhone($request->phone);
        $parent = \App\Models\ParentProfile::where('phone', $phone)->first();

        if (!$parent || !$parent->pin_code || !Hash::check($request->pin, $parent->pin_code)) {
            throw ValidationException::withMessages(['pin' => 'Invalid phone or PIN']);
        }

        $sanctumToken = $parent->createToken('parent_lotos_pin_token')->plainTextToken;

        return response()->json([
            'user' => $parent,
            'token' => $sanctumToken,
        ]);
    }

}