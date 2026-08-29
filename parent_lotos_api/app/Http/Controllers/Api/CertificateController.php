<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalCertificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CertificateController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'child_id' => 'required|exists:children,id',
            'file_path' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240', // 10MB max
            'status' => 'sometimes|in:pending,approved,rejected',
        ]);

        $user = $request->user();
        
        // Verify that the child belongs to the authenticated parent
        $child = $user->children()->where('id', $request->child_id)->first();
        
        if (!$child) {
            return response()->json([
                'message' => 'Child not found or access denied'
            ], 403);
        }

        // Handle file upload
        if ($request->hasFile('file_path')) {
            $file = $request->file('file_path');
            $path = $file->store('medical_certificates', 'public');
            
            // Create certificate record
            $certificate = MedicalCertificate::create([
                'parent_id' => $user->id,
                'child_id' => $request->child_id,
                'file_path' => $path,
                'status' => $request->status ?? 'pending',
            ]);
            
            return response()->json($certificate, 201);
        }
        
        throw ValidationException::withMessages([
            'file_path' => 'File is required'
        ]);
    }
}