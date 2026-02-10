<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\BadgeTierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BadgeTierController extends Controller
{
    public function __construct(private BadgeTierService $badgeTierService)
    {
    }

    /**
     * Get current user's tier information
     */
    public function getUserTier(): JsonResponse
    {
        $user = auth()->user();
        $nextTierInfo = $this->badgeTierService->getNextTierInfo($user);
        
        return response()->json([
            'tier_info' => $nextTierInfo,
            'benefits' => $this->badgeTierService->getTierBenefits($nextTierInfo['current_tier']),
            'next_tier_benefits' => $nextTierInfo['next_tier'] 
                ? $this->badgeTierService->getTierBenefits($nextTierInfo['next_tier'])
                : null,
        ]);
    }

    /**
     * Get tier leaderboard
     */
    public function getLeaderboard(Request $request): JsonResponse
    {
        $tier = $request->query('tier', 'platinum');
        $limit = $request->query('limit', 20);

        $leaderboard = $this->badgeTierService->getLeaderboardByTier($tier, $limit);

        return response()->json([
            'tier' => $tier,
            'leaderboard' => $leaderboard,
        ]);
    }

    /**
     * Get tier statistics
     */
    public function getStatistics(): JsonResponse
    {
        $stats = $this->badgeTierService->getTierStatistics();

        return response()->json($stats);
    }

    /**
     * Get tier benefits
     */
    public function getTierBenefits(string $tier): JsonResponse
    {
        $benefits = $this->badgeTierService->getTierBenefits($tier);

        if (!$benefits) {
            return response()->json(['error' => 'Tier not found'], 404);
        }

        return response()->json($benefits);
    }

    /**
     * Get all tiers information
     */
    public function getAllTiers(): JsonResponse
    {
        $tiers = ['bronze', 'silver', 'gold', 'platinum'];
        $tiers_info = [];

        foreach ($tiers as $tier) {
            $tiers_info[$tier] = $this->badgeTierService->getTierBenefits($tier);
        }

        return response()->json($tiers_info);
    }

    /**
     * Get user tier for any user
     */
    public function getUserTierByUsername(string $username): JsonResponse
    {
        $user = User::where('username', $username)->orWhere('id', $username)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $tier = $this->badgeTierService->determineTier($user->xp);
        $nextTierInfo = $this->badgeTierService->getNextTierInfo($user);

        return response()->json([
            'user_id' => $user->id,
            'username' => $user->display_name,
            'xp' => $user->xp,
            'current_tier' => $tier,
            'tier_info' => $nextTierInfo,
        ]);
    }
}
