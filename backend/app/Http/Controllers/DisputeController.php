<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Submission;
use App\Models\Vote;
use App\Services\ReputationService;
use App\Services\DisputeArbitrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class DisputeController extends Controller
{
    public function __construct(
        private DisputeArbitrationService $arbitrationService,
        private ReputationService $reputationService
    ) {
    }

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
        if ($submission->disputes()
            ->whereIn('status', ['pending', 'under_review'])
            ->exists()) {
            return response()->json([
                'message' => 'An open dispute already exists for this submission.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate([
            'reason' => 'required|string|min:20',
        ]);

        $dispute = Dispute::create([
            'submission_id' => $submission->id,
            'raised_by' => Auth::id(),
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'dispute' => $dispute,
            'message' => 'Dispute raised successfully. Awaiting arbitration.'
        ], Response::HTTP_CREATED);
    }

    /**
     * Assign a dispute to an arbitrator
     */
    public function assignArbitrator(Dispute $dispute, Request $request): JsonResponse
    {
        // Only high-level users can assign disputes
        if (!Auth::user()->canResolveDisputes()) {
            return response()->json([
                'message' => 'Insufficient permissions.'
            ], Response::HTTP_FORBIDDEN);
        }

        $request->validate([
            'arbitrator_id' => 'required|exists:users,id',
        ]);

        $arbitrator = \App\Models\User::findOrFail($request->arbitrator_id);

        try {
            $this->arbitrationService->assignArbitrator($dispute, $arbitrator);

            return response()->json([
                'status' => 'success',
                'message' => 'Dispute assigned to arbitrator.',
                'dispute' => $dispute
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Resolve a dispute with decision and notes
     */
    public function resolve(Dispute $dispute, Request $request): JsonResponse
    {
        // High-trust authorization
        if (!Auth::user()->canResolveDisputes()) {
            return response()->json([
                'message' => 'Insufficient trust level to resolve disputes.'
            ], Response::HTTP_FORBIDDEN);
        }

        if (!in_array($dispute->status, ['pending', 'under_review'])) {
            return response()->json([
                'message' => 'Dispute cannot be resolved in its current state.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate([
            'decision' => 'required|in:invalidate,reject',
            'notes' => 'required|string|min:10',
        ]);

        try {
            $this->arbitrationService->resolveDispute(
                $dispute,
                $request->decision,
                $request->notes,
                $this->reputationService
            );

            // Assign arbitrator if not already assigned
            if (!$dispute->arbitrator_id) {
                $dispute->update(['arbitrator_id' => Auth::id()]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Dispute resolved successfully.',
                'dispute' => $dispute
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Appeal a resolved dispute
     */
    public function appeal(Dispute $dispute, Request $request): JsonResponse
    {
        if ($dispute->status !== 'resolved') {
            return response()->json([
                'message' => 'Can only appeal resolved disputes.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $request->validate([
            'appeal_reason' => 'required|string|min:20',
        ]);

        try {
            $appealDispute = $this->arbitrationService->appealDispute(
                $dispute,
                Auth::user(),
                $request->appeal_reason
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Dispute appealed successfully.',
                'appeal_dispute_id' => $appealDispute->id
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Vote on dispute credibility (community consensus)
     */
    public function voteOnDispute(Dispute $dispute, Request $request): JsonResponse
    {
        $request->validate([
            'support' => 'required|boolean',
        ]);

        // Prevent self-voting on own dispute
        if ($dispute->raised_by === Auth::id()) {
            return response()->json([
                'message' => 'You cannot vote on disputes you raised.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Prevent submission author from voting
        if ($dispute->submission->user_id === Auth::id()) {
            return response()->json([
                'message' => 'Submission authors cannot vote on disputes.'
            ], Response::HTTP_FORBIDDEN);
        }

        $dispute->addCommunityVote($request->support);

        return response()->json([
            'status' => 'success',
            'credibility_score' => $dispute->getCredibilityScore(),
            'upvotes' => $dispute->upvotes,
            'downvotes' => $dispute->downvotes,
        ]);
    }

    /**
     * Get pending disputes
     */
    public function getPending(): JsonResponse
    {
        $disputes = $this->arbitrationService->getPendingDisputes(20);

        return response()->json([
            'count' => count($disputes),
            'disputes' => $disputes->map(fn($d) => [
                'id' => $d->id,
                'submission_id' => $d->submission_id,
                'submission_title' => $d->submission->title ?? 'Deleted',
                'reported_by' => $d->reporter->display_name,
                'reason' => $d->reason,
                'created_at' => $d->created_at,
                'credibility_score' => $d->getCredibilityScore(),
            ])
        ]);
    }

    /**
     * Get high priority disputes
     */
    public function getHighPriority(): JsonResponse
    {
        $disputes = $this->arbitrationService->getHighPriorityDisputes(10);

        return response()->json([
            'count' => count($disputes),
            'disputes' => $disputes->map(fn($d) => [
                'id' => $d->id,
                'submission_id' => $d->submission_id,
                'submission_title' => $d->submission->title ?? 'Deleted',
                'community_support' => $d->upvotes,
                'community_opposition' => $d->downvotes,
                'credibility_score' => $d->getCredibilityScore(),
            ])
        ]);
    }

    /**
     * Get arbitrator metrics
     */
    public function getArbitratorMetrics(): JsonResponse
    {
        if (!Auth::user()->canResolveDisputes()) {
            return response()->json([
                'message' => 'Insufficient permissions.'
            ], Response::HTTP_FORBIDDEN);
        }

        $metrics = $this->arbitrationService->getDisputeMetrics(Auth::user());

        return response()->json($metrics);
    }
}

