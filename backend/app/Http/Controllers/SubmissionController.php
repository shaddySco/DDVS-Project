<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    // Save submission after blockchain success
    public function store(Request $request)
    {
        $validated = $request->validate([
            'wallet_address' => 'required|string',
            'github_link' => 'required|url',
            'description' => 'required|string',
            'tx_hash' => 'required|string',
        ]);

        $submission = Submission::create($validated);

        return response()->json([
            'message' => 'Submission synced with blockchain',
            'data' => $submission
        ], 201);
    }

    // Fetch submissions for public feed
    public function index()
    {
        return Submission::orderBy('created_at', 'desc')->get();
    }
}
