<?php

namespace App\Services;

use App\Models\Submission;
use App\Models\User;
use App\Models\SkillReputation;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use App\Models\Vote;


class ReputationService
{
    public const VOTE_XP_REWARD = 10;
    public const SUBMISSION_XP_REWARD = 50;
    public const XP_PENALTY_MULTIPLIER = 2;
    public const LEVEL_DIVISOR = 100;

    /**
     * Award XP to a submission author after a valid vote.
     * Supports both global and category-specific XP.
     */
    public function awardXpForVote(Submission $submission): void
    {
        if ($submission->ownership_status === 'invalidated') {
            throw new RuntimeException('Cannot award XP to an invalidated submission.');
        }

        DB::transaction(function () use ($submission) {
            $author = $submission->user;
            
            // Award global XP
            $author->increment('xp', self::VOTE_XP_REWARD);
            
            // Award category-specific XP
            $this->awardCategoryXp($author, $submission->category, self::VOTE_XP_REWARD);
        });
    }

    /**
     * Award XP to a submission author after their project is verified.
     */
    public function awardXpForSubmission(Submission $submission): void
    {
        DB::transaction(function () use ($submission) {
            $author = $submission->user;
            
            // Award global XP
            $author->increment('xp', self::SUBMISSION_XP_REWARD);
            
            // Award category-specific XP and increment submission count
            $this->awardCategoryXp($author, $submission->category, self::SUBMISSION_XP_REWARD, true);
        });
    }

    /**
     * Award XP for a specific skill category
     */
    public function awardCategoryXp(User $user, string $category, int $xpAmount = self::VOTE_XP_REWARD, bool $isNewSubmission = false): void
    {
        DB::transaction(function () use ($user, $category, $xpAmount, $isNewSubmission) {
            $skillRep = SkillReputation::firstOrCreate(
                ['user_id' => $user->id, 'category' => $category],
                ['xp' => 0, 'level' => 1, 'submission_count' => 0]
            );

            $skillRep->awardXp($xpAmount);
            
            if ($isNewSubmission) {
                $skillRep->increment('submission_count');
            }
            
            // Update user's category_xp JSON
            $categoryXp = $user->category_xp ?? [];
            $categoryXp[$category] = ($categoryXp[$category] ?? 0) + $xpAmount;
            
            // Update user's skills_verified if it's a new verified submission
            $skillsVerified = $user->skills_verified ?? [];
            if ($isNewSubmission && !in_array($category, $skillsVerified)) {
                $skillsVerified[] = $category;
            }

            $user->update([
                'category_xp' => $categoryXp,
                'skills_verified' => $skillsVerified
            ]);
        });
    }

    /**
     * Get user's skill-specific stats
     */
    public function getUserSkillStats(User $user): array
    {
        $skills = $user->skillReputation()->get();
        
        return $skills->map(function (SkillReputation $skill) {
            return [
                'category' => $skill->category,
                'xp' => $skill->xp,
                'level' => $skill->level,
                'next_level_xp' => ($skill->level * 100),
                'progress' => ($skill->xp % 100),
                'submission_count' => $skill->submission_count,
                'is_mastered' => $skill->isMastered(),
            ];
        })->toArray();
    }

    /**
     * Get top skills for a user
     */
    public function getUserTopSkills(User $user, int $limit = 5): array
    {
        return $user->skillReputation()
            ->orderBy('xp', 'desc')
            ->limit($limit)
            ->get()
            ->map(function (SkillReputation $skill) {
                return [
                    'category' => $skill->category,
                    'xp' => $skill->xp,
                    'level' => $skill->level,
                ];
            })
            ->toArray();
    }

    /**
     * Reverse XP gained from a submission (both global and category)
     */
    public function reverseXpForSubmission(Submission $submission): void
    {
        DB::transaction(function () use ($submission) {
            $author = $submission->user;
            $votesCount = $submission->votes()->count();
            $xpToReverse = $votesCount * self::VOTE_XP_REWARD;

            // Reverse global XP
            $author->decrement('xp', min($author->xp, $xpToReverse));

            // Reverse category XP
            $skillRep = SkillReputation::where('user_id', $author->id)
                ->where('category', $submission->category)
                ->first();
                
            if ($skillRep) {
                $skillRep->deductXp(min($skillRep->xp, $xpToReverse));
            }
        });
    }

    /**
     * Apply XP penalty after misconduct (both global and category)
     */
    public function applyXpPenalty(Submission $submission): void
    {
        DB::transaction(function () use ($submission) {
            $author = $submission->user;
            $votesCount = $submission->votes()->count();
            $gainedXp = $votesCount * self::VOTE_XP_REWARD;
            $penalty = $gainedXp * self::XP_PENALTY_MULTIPLIER;

            // Penalize global XP
            $author->decrement('xp', min($author->xp, $penalty));

            // Penalize category XP
            $skillRep = SkillReputation::where('user_id', $author->id)
                ->where('category', $submission->category)
                ->first();
                
            if ($skillRep) {
                $skillRep->deductXp(min($skillRep->xp, $penalty));
            }
        });
    }

    /**
     * Derive level from XP.
     */
    public function deriveLevel(User $user): int
    {
        return intdiv($user->xp, self::LEVEL_DIVISOR) + 1;
    }

    /**
     * Invalidate submission and reverse all rewards
     */
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

    /**
     * Remove XP from user (global only, for compatibility)
     */
    public function removeXp(User $user, int $amount): void
    {
        $user->update([
            'xp' => max(0, $user->xp - $amount),
        ]);
    }

    /**
     * Reverse vote XP
     */
    public function reverseVoteXP(Vote $vote): void
    {
        $author = $vote->submission->user;
        $category = $vote->submission->category;

        // Reverse global XP
        $author->update([
            'xp' => max(0, $author->xp - 10),
        ]);

        // Reverse category XP
        $skillRep = SkillReputation::where('user_id', $author->id)
            ->where('category', $category)
            ->first();
            
        if ($skillRep) {
            $skillRep->deductXp(10);
        }
    }

    /**
     * Get category leaderboard
     */
    public function getCategoryLeaderboard(string $category, int $limit = 20)
    {
        return SkillReputation::where('category', $category)
            ->orderBy('xp', 'desc')
            ->with('user')
            ->limit($limit)
            ->get()
            ->map(function (SkillReputation $skill) {
                return [
                    'user_id' => $skill->user_id,
                    'display_name' => $skill->user->display_name,
                    'xp' => $skill->xp,
                    'level' => $skill->level,
                    'category' => $skill->category,
                ];
            })
            ->toArray();
    }
}
