<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CabinetController;
use App\Http\Controllers\Api\ChildrenController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\AchievementController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\InviteController;

Route::prefix('auth')->group(function () {
    Route::post('request-otp', [AuthController::class, 'requestOtp']);
    Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [CabinetController::class, 'me']);
    Route::get('children', [ChildrenController::class, 'index']);
    Route::get('schedule', [ScheduleController::class, 'index']);
    Route::get('schedule/{childId}', [ScheduleController::class, 'forChild']);
    Route::get('attendance', [ScheduleController::class, 'attendance']);
    Route::get('subscriptions', [LoyaltyController::class, 'index']);
    Route::post('certificates', [CertificateController::class, 'store']);
    Route::get('achievements/{childId}', [AchievementController::class, 'index']);
});

Route::post('webhooks/yclients', [WebhookController::class, 'handle']);
Route::get('invite/{token}', [InviteController::class, 'resolve']);
