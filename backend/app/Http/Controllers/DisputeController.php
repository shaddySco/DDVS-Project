<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class DisputeController extends Controller
{
    public function store(Request $request, Submission $submission): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        if ($submission->user_id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot dispute your own submission.'
            ], Response::HTTP_FORBIDDEN);
        }

        $submission->update([
            'ownership_status' => 'disputed'
        ]);

        Dispute::create([
            'submission_id' => $submission->id,
            'raised_by' => Auth::id(),
            'reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Dispute raised successfully.'
        ]);
    }
}
