<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Submission;
use App\Models\Vote;
use App\Services\ReputationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class DisputeController extends Controller
{
    /**
     * Raise a dispute against a submission
     */
    public function store(Request $request, Submission $submission): JsonResponse
    {
        // Cannot dispute own submission
        if ($submission->user_id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot dispute your own submission.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Prevent duplicate open disputes
        if ($submission->disputes()->where('status', 'open')->exists()) {
            return response()->json([
                'message' => 'An open dispute already exists for this submission.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate([
            'reason' => 'required|string|min:20',
        ]);

        $dispute = Dispute::create([
            'submission_id' => $submission->id,
            'reporter_id'   => Auth::id(),
            'reason'        => $request->reason,
        ]);

        // Move submission into disputed state via domain logic
        $submission->markDisputed();

        return response()->json($dispute, Response::HTTP_CREATED);
    }

    /**
     * Resolve a dispute (invalidate or reject)
     */
    public function resolve(
        Dispute $dispute,
        Request $request,
        ReputationService $reputationService
    ): JsonResponse {
        // High-trust authorization
        if (!Auth::user()->canResolveDisputes()) {
            return response()->json([
                'message' => 'Insufficient trust level to resolve disputes.'
            ], Response::HTTP_FORBIDDEN);
        }

        if ($dispute->status !== 'open') {
            return response()->json([
                'message' => 'Dispute already resolved.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate([
            'decision' => 'required|in:invalidate,reject',
        ]);

        DB::transaction(function () use ($dispute, $request, $reputationService) {

            $submission = $dispute->submission;

            if ($request->decision === 'invalidate') {

                // Reverse XP from all votes on the submission
                $votes = Vote::where('submission_id', $submission->id)->get();

                foreach ($votes as $vote) {
                    $reputationService->reverseVoteXP($vote);
                    $vote->delete();
                }

                // Invalidate submission via domain logic
                $submission->markInvalidated();
            }

            // Finalize dispute
            $dispute->update([
                'status'      => $request->decision === 'invalidate'
                    ? 'resolved'
                    : 'rejected',
                'resolved_by' => Auth::id(),
                'resolved_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Dispute resolved successfully.'
        ], Response::HTTP_OK);
    }
}
