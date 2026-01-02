<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVoteRequest;
use App\Models\Submission;
use App\Models\Vote;
use App\Services\ReputationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class VoteController extends Controller
{
    protected ReputationService $reputationService;

    public function __construct(ReputationService $reputationService)
    {
        $this->reputationService = $reputationService;
    }

    /**
     * Cast a vote on a submission.
     */
    
    public function store(StoreVoteRequest $request): JsonResponse
    {
        if (
    $submission->ownership_status === 'disputed' ||
    $submission->ownership_status === 'invalidated'
) {
    return response()->json([
        'message' => 'Voting is disabled for this submission.'
    ], Response::HTTP_FORBIDDEN);
}
      
         $user = Auth::user();
   

        /** @var Submission $submission */
        $submission = Submission::findOrFail($request->submission_id);

        // Guard: submission integrity
        if (in_array($submission->ownership_status, ['invalidated', 'disputed'])) {
            return response()->json([
                'message' => 'Voting is not allowed on this submission.'
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            // Create vote (DB enforces uniqueness)
            Vote::create([
                'submission_id' => $submission->id,
                'voter_id' => $user->id,
            ]);

            // Award XP via service (single source of truth)
            $this->reputationService->awardXpForVote($submission);

        } catch (QueryException $e) {
            // Duplicate vote protection
            return response()->json([
                'message' => 'You have already voted on this submission.'
            ], Response::HTTP_CONFLICT);
        }

        return response()->json([
            'message' => 'Vote recorded successfully.',
            'xp' => $user->fresh()->xp,
            'level' => $user->fresh()->level,
        ], Response::HTTP_CREATED);
    }
}
