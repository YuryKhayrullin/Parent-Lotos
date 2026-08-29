<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\YclientsClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LoyaltyController extends Controller
{
    protected $yclients;

    public function __construct(YclientsClient $yclients)
    {
        $this->yclients = $yclients;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user instanceof \App\Models\ParentProfile) {
            try {
                // Get loyalty/subscription data for the client
                $loyaltyData = $this->yclients->getClientLoyalty(
                    $user->yclients_client_id
                );
                
                return response()->json($loyaltyData);
            } catch (YclientsApiException $e) {
                return response()->json([
                    'message' => 'Error fetching loyalty data from YCLIENTS'
                ], 502);
            }
        }
        
        return response()->json([]);
    }
}