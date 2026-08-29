<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InviteToken;
use App\Services\Yclients\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class WebhookController extends Controller
{
    protected $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function handle(Request $request)
    {
        // Log the webhook payload for debugging
        Log::info('YCLIENTS webhook received', $request->all());
        
        // Verify webhook signature if needed (implementation depends on YCLIENTS)
        // For now, we'll process based on event type
        
        $eventType = $request->input('event');
        $data = $request->input('data', []);
        
        switch ($eventType) {
            case 'abonement_purchased':
            case 'loyalty_transaction':
                // Handle subscription/payment webhook
                $this->handleSubscriptionPurchase($data);
                break;
                
            case 'client_created':
            case 'client_updated':
                // Handle client updates
                $this->handleClientUpdate($data);
                break;
                
            default:
                Log::warning('Unhandled YCLIENTS webhook event: ' . $eventType);
                break;
        }
        
        return response()->json(['status' => 'ok']);
    }

    protected function handleSubscriptionPurchase(array $data)
    {
        // Extract client ID from webhook data
        $clientId = $data['client_id'] ?? null;
        if (!$clientId) {
            Log::warning('YCLIENTS webhook missing client_id in subscription purchase');
            return;
        }
        
        try {
            // Find parent by YCLIENTS client ID
            $parent = \App\Models\ParentProfile::where('yclients_client_id', $clientId)->first();
            
            if (!$parent) {
                Log::warning("Parent not found for YCLIENTS client_id: {$clientId}");
                return;
            }
            
            // Generate invite token
            $token = Str::uuid()->toString();
            $expiresAt = Carbon::now()->addDays(7); // Token valid for 7 days
            
            // Create invite token record
            InviteToken::create([
                'parent_id' => $parent->id,
                'token' => $token,
                'phone' => $parent->phone,
                'expires_at' => $expiresAt,
                'source' => 'webhook_abonement',
            ]);
            
            // TODO: Send SMS with invite link
            // $this->sendInviteSms($parent->phone, $token);
            
            Log::info("Invite token generated for parent {$parent->id} after subscription purchase");
            
        } catch (\Exception $e) {
            Log::error('Error processing subscription purchase webhook: ' . $e->getMessage());
        }
    }

    protected function handleClientUpdate(array $data)
    {
        // Extract client ID from webhook data
        $clientId = $data['id'] ?? null;
        if (!$clientId) {
            Log::warning('YCLIENTS webhook missing client_id in client update');
            return;
        }
        
        try {
            // Find parent by YCLIENTS client ID
            $parent = \App\Models\ParentProfile::where('yclients_client_id', $clientId)->first();
            
            if (!$parent) {
                Log::warning("Parent not found for YCLIENTS client_id: {$clientId}");
                return;
            }
            
            // Sync parent and children data
            $this->clientService->syncParentWithChildren($parent->phone);
            
            Log::info("Parent {$parent->id} synchronized via webhook");
            
        } catch (\Exception $e) {
            Log::error('Error processing client update webhook: ' . $e->getMessage());
        }
    }

    protected function sendInviteSms(string $phone, string $token): void
    {
        // TODO: Implement actual SMS sending via YCLIENTS or SMS.ru
        $inviteUrl = config('app.url') . "/invite/{$token}";
        $message = "Абонемент оплачен! Ваш кабинет: {$inviteUrl}";
        
        Log::info("SMS to {$phone}: {$message}");
        // Actual implementation would go here
    }
}