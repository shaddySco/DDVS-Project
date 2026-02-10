<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ReputationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillReputationController extends Controller
{
    public function __construct(private ReputationService $reputationService)
    {
    }

    /**
     * Get current user's skill reputation
     */
    public function getUserSkills(): JsonResponse
    {
        $user = auth()->user();
        $skills = $this->reputationService->getUserSkillStats($user);
        $topSkills = $this->reputationService->getUserTopSkills($user, 5);

        return response()->json([
            'user_id' => $user->id,
            'global_xp' => $user->xp,
            'level' => $user->level,
            'all_skills' => $skills,
            'top_skills' => $topSkills,
        ]);
    }

    /**
     * Get skill reputation for a specific user
     */
    public function getUserSkillsByUsername(string $username): JsonResponse
    {
        $user = User::where('username', $username)->orWhere('id', $username)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $skills = $this->reputationService->getUserSkillStats($user);
        $topSkills = $this->reputationService->getUserTopSkills($user, 5);

        return response()->json([
            'user_id' => $user->id,
            'username' => $user->display_name,
            'global_xp' => $user->xp,
            'level' => $user->level,
            'all_skills' => $skills,
            'top_skills' => $topSkills,
        ]);
    }

    /**
     * Get category leaderboard
     */
    public function getCategoryLeaderboard(Request $request): JsonResponse
    {
        $category = $request->query('category', 'web-dev');
        $limit = $request->query('limit', 20);

        $leaderboard = $this->reputationService->getCategoryLeaderboard($category, $limit);

        return response()->json([
            'category' => $category,
            'leaderboard' => $leaderboard,
        ]);
    }

    /**
     * Get skill statistics for a category
     */
    public function getCategoryStatistics(Request $request): JsonResponse
    {
        $category = $request->query('category', 'web-dev');

        $stats = [
            'category' => $category,
            'total_developers' => count($this->reputationService->getCategoryLeaderboard($category, PHP_INT_MAX)),
            'top_experts' => $this->reputationService->getCategoryLeaderboard($category, 10),
        ];

        return response()->json($stats);
    }

    /**
     * Get popular categories
     */
    public function getPopularCategories(): JsonResponse
    {
        $categories = [
            'web-dev' => [
                'name' => 'Web Development',
                'description' => 'Frontend, backend, and full-stack development',
                'icon' => '🌐',
            ],
            'blockchain' => [
                'name' => 'Blockchain & Web3',
                'description' => 'Smart contracts, DeFi, and blockchain development',
                'icon' => '⛓️',
            ],
            'mobile-dev' => [
                'name' => 'Mobile Development',
                'description' => 'iOS, Android, and cross-platform mobile apps',
                'icon' => '📱',
            ],
            'devops' => [
                'name' => 'DevOps & Infrastructure',
                'description' => 'Cloud deployment, CI/CD, and infrastructure',
                'icon' => '⚙️',
            ],
            'data-science' => [
                'name' => 'Data Science & AI',
                'description' => 'Machine learning, data analysis, and AI',
                'icon' => '🤖',
            ],
            'security' => [
                'name' => 'Security & Cryptography',
                'description' => 'Application security and cryptographic systems',
                'icon' => '🔐',
            ],
        ];

        return response()->json($categories);
    }
}
