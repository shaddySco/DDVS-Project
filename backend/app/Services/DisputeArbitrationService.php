<?php

namespace App\Services;

use App\Models\Dispute;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DisputeArbitrationService
{
    /**
     * Assign a dispute to an arbitrator for review
     */
    public function assignArbitrator(Dispute $dispute, User $arbitrator): void
    {
        if (!$arbitrator->canResolveDisputes()) {
            throw new \Exception('User does not have permission to arbitrate disputes.');
        }

        $dispute->markUnderReview($arbitrator->id);
    }

    /**
     * Resolve a dispute and apply consequences
     */
    public function resolveDispute(
        Dispute $dispute,
        string $decision,
        string $notes,
        ReputationService $reputationService
    ): void {
        DB::transaction(function () use ($dispute, $decision, $notes, $reputationService) {
            $submission = $dispute->submission;

            // Resolve the dispute
            $dispute->resolve($decision, $notes);

            // Apply decision consequences
            if ($decision === 'invalidate') {
                $this->invalidateSubmission($submission, $reputationService);
            } elseif ($decision === 'reject') {
                $this->rejectDispute($dispute);
            }
        });
    }

    /**
     * Appeal a resolved dispute for higher-level review
     */
    public function appealDispute(Dispute $dispute, User $appellant, string $appealReason): Dispute
    {
        if ($dispute->status !== 'resolved') {
            throw new \Exception('Can only appeal resolved disputes.');
        }

        // Create new dispute for appeal
        $appealDispute = Dispute::create([
            'submission_id' => $dispute->submission_id,
            'raised_by' => $appellant->id,
            'reason' => "APPEAL: {$appealReason}\nOriginal Dispute ID: {$dispute->id}",
            'status' => 'pending',
        ]);

        $dispute->appeal();

        return $appealDispute;
    }

    /**
     * Invalidate a submission and reverse rewards
     */
    private function invalidateSubmission(Submission $submission, ReputationService $reputationService): void
    {
        $reputationService->reverseXpForSubmission($submission);
        $reputationService->applyXpPenalty($submission);

        // Mark as invalidated
        $submission->update([
            'ownership_status' => 'invalidated',
        ]);

        // Delete associated votes
        $submission->votes()->delete();
    }

    /**
     * Reject a dispute (the submission remains valid)
     */
    private function rejectDispute(Dispute $dispute): void
    {
        // Optionally penalize the false reporter
        $reporter = $dispute->reporter;

        // Small penalty for frivolous disputes
        if ($dispute->getCredibilityScore() < 30) {
            $reporter->decrement('xp', 5); // Minor penalty
        }
    }

    /**
     * Get disputes pending arbitration
     */
    public function getPendingDisputes(int $limit = 10)
    {
        return Dispute::where('status', 'pending')
            ->with(['submission', 'reporter'])
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get high-priority disputes (community consensus against submission)
     */
    public function getHighPriorityDisputes(int $limit = 10)
    {
        return Dispute::where('status', 'pending')
            ->where('upvotes', '>', 'downvotes')
            ->with(['submission', 'reporter'])
            ->orderBy('upvotes', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate dispute resolution metrics
     */
    public function getDisputeMetrics(User $arbitrator)
    {
        $resolved = Dispute::where('arbitrator_id', $arbitrator->id)
            ->where('status', 'resolved')
            ->count();

        $appealed = Dispute::where('arbitrator_id', $arbitrator->id)
            ->where('status', 'appealed')
            ->count();

        $accuracy = $resolved > 0 ? (($resolved - $appealed) / $resolved) * 100 : 0;

        return [
            'resolved_count' => $resolved,
            'appealed_count' => $appealed,
            'accuracy_rate' => $accuracy,
            'total_decisions' => $resolved,
        ];
    }
}
