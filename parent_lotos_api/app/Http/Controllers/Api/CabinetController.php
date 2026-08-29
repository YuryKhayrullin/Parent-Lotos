<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CabinetController extends Controller
{
    protected $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        // If user is a ParentProfile model (from our auth system)
        if ($user instanceof \App\Models\ParentProfile) {
            try {
                // Sync latest data from YCLIENTS
                $parent = $this->clientService->syncParentWithChildren($user->phone);
                
                return response()->json($parent);
            } catch (ClientNotFoundException $e) {
                return response()->json([
                    'message' => 'Phone number not found in the system'
                ], 404);
            } catch (YclientsApiException $e) {
                // Return cached data if YCLIENTS is unavailable
                return response()->json($user);
            }
        }
        
        // Fallback for other user types
        return response()->json($user);
    }
}