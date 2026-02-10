<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispute extends Model
{
    protected $fillable = [
        'submission_id',
        'raised_by',
        'reason',
        'status',
        'arbitrator_id',
        'decision',
        'arbitrator_notes',
        'upvotes',
        'downvotes',
        'resolved_at',
        'appealed_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'appealed_at' => 'datetime',
    ];

    /* =======================
     | Relationships
     ======================= */

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function arbitrator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'arbitrator_id');
    }

    /* =======================
     | Dispute Workflow Helpers
     ======================= */

    /**
     * Mark dispute as under review by arbitrator
     */
    public function markUnderReview(int $arbitratorId): void
    {
        $this->update([
            'status' => 'under_review',
            'arbitrator_id' => $arbitratorId,
        ]);
    }

    /**
     * Resolve the dispute with a decision
     */
    public function resolve(string $decision, string $notes): void
    {
        if (!in_array($decision, ['invalidate', 'reject'])) {
            throw new \Exception('Invalid decision. Must be invalidate or reject.');
        }

        $this->update([
            'status' => 'resolved',
            'decision' => $decision,
            'arbitrator_notes' => $notes,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Appeal a resolved dispute
     */
    public function appeal(): void
    {
        if ($this->status !== 'resolved') {
            throw new \Exception('Can only appeal resolved disputes.');
        }

        $this->update([
            'status' => 'appealed',
            'appealed_at' => now(),
        ]);
    }

    /**
     * Close the dispute permanently
     */
    public function close(): void
    {
        $this->update(['status' => 'closed']);
    }

    /**
     * Add community vote on dispute credibility
     */
    public function addCommunityVote(bool $supportDispute): void
    {
        if ($supportDispute) {
            $this->increment('upvotes');
        } else {
            $this->increment('downvotes');
        }
    }

    /**
     * Get dispute credibility score (0-100)
     */
    public function getCredibilityScore(): int
    {
        $totalVotes = $this->upvotes + $this->downvotes;
        
        if ($totalVotes === 0) {
            return 50; // Neutral if no votes
        }

        return (int)(($this->upvotes / $totalVotes) * 100);
    }

    /**
     * Check if dispute is likely valid based on community consensus
     */
    public function isLikelyValid(): bool
    {
        return $this->getCredibilityScore() >= 60;
    }
}
