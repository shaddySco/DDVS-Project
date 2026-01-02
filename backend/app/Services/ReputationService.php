<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReputationService
{
    public const VOTE_XP_REWARD = 10;
    public const XP_PENALTY_MULTIPLIER = 2;
    public const LEVEL_DIVISOR = 100;

    /**
     * Award XP to a submission author after a valid vote.
     * This is the ONLY way XP can be gained.
     */
    public function awardXpForVote(Submission $submission): void
    {
        if ($submission->ownership_status === 'invalidated') {
            throw new RuntimeException('Cannot award XP to an invalidated submission.');
        }

        DB::transaction(function () use ($submission) {
            $author = $submission->author;
            $author->increment('xp', self::VOTE_XP_REWARD);
        });
    }

    /**
     * Reverse XP gained from a submission.
     */
    public function reverseXpForSubmission(Submission $submission): void
    {
        DB::transaction(function () use ($submission) {
            $author = $submission->author;

            $votesCount = $submission->votes()->count();
            $xpToReverse = $votesCount * self::VOTE_XP_REWARD;

            $author->decrement('xp', min($author->xp, $xpToReverse));
        });
    }

    /**
     * Apply XP penalty after misconduct.
     */
    public function applyXpPenalty(Submission $submission): void
    {
        DB::transaction(function () use ($submission) {
            $author = $submission->author;

            $votesCount = $submission->votes()->count();
            $gainedXp = $votesCount * self::VOTE_XP_REWARD;
            $penalty = $gainedXp * self::XP_PENALTY_MULTIPLIER;

            $author->decrement('xp', min($author->xp, $penalty));
        });
    }

    /**
     * Derive level from XP.
     */
    public function deriveLevel(User $user): int
    {
        return intdiv($user->xp, self::LEVEL_DIVISOR) + 1;
    }

    public function invalidateSubmission(Submission $submission): void
{
    $votes = $submission->votes;

    foreach ($votes as $vote) {
        $this->removeXp($submission->user, 10);
        $vote->delete();
    }

    $submission->update([
        'ownership_status' => 'invalidated'
    ]);
}

}
