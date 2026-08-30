<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AchievementController extends Controller
{
    public function index(Request $request, string $childId)
    {
        $user = $request->user();
        
        // Verify that the child belongs to the authenticated parent
        $child = $user->children()->where('yclients_visitor_id', $childId)->first();
        
        if (!$child) {
            return response()->json([
                'message' => 'Child not found or access denied'
            ], 403);
        }
        
        // Get achievements for this child
        $achievements = Achievement::where('child_id', $child->id)->get();
        
        return response()->json($achievements);
    }
}