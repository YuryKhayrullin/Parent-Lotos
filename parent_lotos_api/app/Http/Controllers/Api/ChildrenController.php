<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use App\Services\Yclients\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ChildrenController extends Controller
{
    protected $clientService;

    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // If user is a ParentProfile model
        if ($user instanceof \App\Models\ParentProfile) {
            try {
                // Sync latest data from YCLIENTS to ensure we have current children
                $parent = $this->clientService->syncParentWithChildren($user->phone);
                
                // Return children associated with this parent
                $children = $parent->children;
                
                return response()->json($children);
            } catch (ClientNotFoundException $e) {
                return response()->json([
                    'message' => 'Phone number not found in the system'
                ], 404);
            } catch (YclientsApiException $e) {
                // Return cached children if YCLIENTS is unavailable
                $children = $user->children;
                return response()->json($children);
            }
        }
        
        // Fallback
        return response()->json([]);
    }
}