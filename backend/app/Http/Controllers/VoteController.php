<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVoteRequest;
use App\Models\Submission;
use App\Models\Vote;
use Illuminate\Http\Request;
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
public function store(StoreVoteRequest $request)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json([
            'message' => 'Unauthenticated'
        ], 401);
    }

    $submission = Submission::findOrFail($request->submission_id);

    // Prevent duplicate votes
    if (Vote::where('user_id', $user->id)
        ->where('submission_id', $submission->id)
        ->exists()) {
        return response()->json([
            'message' => 'You already voted on this submission'
        ], 409);
    }

    // Create vote
    Vote::create([
        'user_id' => $user->id,
        'submission_id' => $submission->id,
        'type' => $request->type,
    ]);

    // Reputation update must NEVER break voting
    try {
        app(ReputationService::class)->applyVote($submission, $user);
    } catch (\Throwable $e) {
        Log::error('ReputationService failed', [
            'error' => $e->getMessage(),
        ]);
    }

    return response()->json([
        'message' => 'Vote recorded successfully',
        'total_votes' => $submission->votes()->count(),
        'has_voted' => true,
    ], 201);
}
    /**
     * Cast a vote on a submission.
     */
}