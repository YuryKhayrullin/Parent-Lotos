<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InviteToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class InviteController extends Controller
{
    public function resolve(Request $request, string $token)
    {
        // Find the invite token
        $inviteToken = InviteToken::where('token', $token)
            ->where('used_at', null)
            ->where('expires_at', '>', now())
            ->first();
        
        if (!$inviteToken) {
            return response()->json([
                'message' => 'Invalid or expired invite token'
            ], 400);
        }
        
        // Mark token as used
        $inviteToken->update([
            'used_at' => now(),
        ]);
        
        // Authenticate the user (parent) associated with this token
        $parent = $inviteToken->parent;
        
        if (!$parent) {
            return response()->json([
                'message' => 'Parent not found for this invite token'
            ], 404);
        }
        
        // Create personal access token (Sanctum) for the parent
        $sanctumToken = $parent->createToken('parent_lotos_invite_token')->plainTextToken;
        
        return response()->json([
            'user' => $parent,
            'token' => $sanctumToken,
            'message' => 'Invite token resolved successfully'
        ]);
    }
}