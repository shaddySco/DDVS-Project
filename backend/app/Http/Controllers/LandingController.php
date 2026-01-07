<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Submission;
use App\Models\Vote;
use Illuminate\Http\JsonResponse;

class LandingController extends Controller
{
    public function stats(): JsonResponse
    {
        // Build leaderboard FIRST
        $leaderboard = User::orderByDesc('xp')
            ->take(5)
            ->get(['username', 'xp'])
            ->map(function ($user) {
                return [
                    'username' => $user->username,
                    'xp' => $user->xp,
                    'level' => floor($user->xp / 500) + 1,
                ];
            });

        // Return response ONCE
        return response()->json([
            'stats' => [
                'totalDevelopers' => User::count(),
                'totalSubmissions' => Submission::count(),
                'totalVotes' => Vote::count(),
            ],
            'leaderboard' => $leaderboard,
        ]);
    }
}
