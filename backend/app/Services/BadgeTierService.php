<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class BadgeTierService
{
    // Badge tier thresholds (aligned with smart contract)
    public const BRONZE_THRESHOLD = 50;
    public const SILVER_THRESHOLD = 150;
    public const GOLD_THRESHOLD = 300;
    public const PLATINUM_THRESHOLD = 500;

    public const TIERS = [
        'none' => 0,
        'bronze' => self::BRONZE_THRESHOLD,
        'silver' => self::SILVER_THRESHOLD,
        'gold' => self::GOLD_THRESHOLD,
        'platinum' => self::PLATINUM_THRESHOLD,
    ];

    /**
     * Determine badge tier based on XP
     */
    public function determineTier(int $xp): string
    {
        if ($xp >= self::PLATINUM_THRESHOLD) {
            return 'platinum';
        } elseif ($xp >= self::GOLD_THRESHOLD) {
            return 'gold';
        } elseif ($xp >= self::SILVER_THRESHOLD) {
            return 'silver';
        } elseif ($xp >= self::BRONZE_THRESHOLD) {
            return 'bronze';
        }
        return 'none';
    }

    /**
     * Get next tier info for a user
     */
    public function getNextTierInfo(User $user): array
    {
        $currentTier = $this->determineTier($user->xp);
        $tierProgression = ['none', 'bronze', 'silver', 'gold', 'platinum'];
        $currentIndex = array_search($currentTier, $tierProgression);

        if ($currentIndex === 4) {
            // User is at max tier
            return [
                'current_tier' => $currentTier,
                'next_tier' => null,
                'xp_needed' => 0,
                'progress_percentage' => 100,
            ];
        }

        $nextTier = $tierProgression[$currentIndex + 1];
        $nextThreshold = self::TIERS[$nextTier];
        $xpNeeded = max(0, $nextThreshold - $user->xp);
        $progressPercentage = ($user->xp / $nextThreshold) * 100;

        return [
            'current_tier' => $currentTier,
            'next_tier' => $nextTier,
            'current_xp' => $user->xp,
            'next_tier_xp' => $nextThreshold,
            'xp_needed' => $xpNeeded,
            'progress_percentage' => min(100, $progressPercentage),
        ];
    }

    /**
     * Get all users by tier
     */
    public function getUsersByTier(string $tier, int $limit = 100)
    {
        if (!isset(self::TIERS[$tier])) {
            throw new \Exception("Invalid tier: {$tier}");
        }

        $threshold = self::TIERS[$tier];
        $maxXp = $tier === 'platinum' 
            ? PHP_INT_MAX 
            : array_values(self::TIERS)[array_search($tier, array_keys(self::TIERS)) + 1];

        return User::whereBetween('xp', [$threshold, $maxXp])
            ->orderBy('xp', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get tier distribution statistics
     */
    public function getTierStatistics()
    {
        return [
            'none' => User::whereBetween('xp', [0, self::BRONZE_THRESHOLD - 1])->count(),
            'bronze' => User::whereBetween('xp', [self::BRONZE_THRESHOLD, self::SILVER_THRESHOLD - 1])->count(),
            'silver' => User::whereBetween('xp', [self::SILVER_THRESHOLD, self::GOLD_THRESHOLD - 1])->count(),
            'gold' => User::whereBetween('xp', [self::GOLD_THRESHOLD, self::PLATINUM_THRESHOLD - 1])->count(),
            'platinum' => User::where('xp', '>=', self::PLATINUM_THRESHOLD)->count(),
            'total_users' => User::count(),
        ];
    }

    /**
     * Get leaderboard by tier
     */
    public function getLeaderboardByTier(string $tier, int $limit = 20)
    {
        return $this->getUsersByTier($tier, $limit)
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'display_name' => $user->display_name,
                    'xp' => $user->xp,
                    'level' => $user->level,
                    'tier' => $this->determineTier($user->xp),
                    'submissions_count' => $user->submissions()->count(),
                ];
            });
    }

    /**
     * Check if user can upgrade tier
     */
    public function canUpgradeTier(User $user): bool
    {
        $currentTier = $this->determineTier($user->xp);
        return $currentTier !== 'platinum';
    }

    /**
     * Get tier benefits/requirements
     */
    public function getTierBenefits(string $tier): array
    {
        $benefits = [
            'none' => [
                'description' => 'New Developer',
                'xp_required' => 0,
                'benefits' => [
                    'Submit projects',
                    'Vote on submissions',
                    'Join community',
                ],
                'badge' => null,
            ],
            'bronze' => [
                'description' => 'Emerging Developer',
                'xp_required' => self::BRONZE_THRESHOLD,
                'benefits' => [
                    'Bronze NFT Badge',
                    'Community voting power',
                    'Access to community forums',
                ],
                'badge_color' => '#CD7F32',
            ],
            'silver' => [
                'description' => 'Skilled Developer',
                'xp_required' => self::SILVER_THRESHOLD,
                'benefits' => [
                    'Silver NFT Badge',
                    'Enhanced voting power',
                    'Featured in community highlights',
                    'Mentor other developers',
                ],
                'badge_color' => '#C0C0C0',
            ],
            'gold' => [
                'description' => 'Expert Developer',
                'xp_required' => self::GOLD_THRESHOLD,
                'benefits' => [
                    'Gold NFT Badge',
                    'Significant voting power',
                    'Can moderate disputes',
                    'Featured in platform highlights',
                ],
                'badge_color' => '#FFD700',
            ],
            'platinum' => [
                'description' => 'Master Developer',
                'xp_required' => self::PLATINUM_THRESHOLD,
                'benefits' => [
                    'Platinum NFT Badge',
                    'Maximum voting power',
                    'Arbitrate high-stakes disputes',
                    'Leadership role in community',
                    'Special recognition',
                ],
                'badge_color' => '#E5E4E2',
            ],
        ];

        return $benefits[$tier] ?? [];
    }
}
