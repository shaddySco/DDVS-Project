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
            ->get(['id', 'username', 'name', 'wallet_address', 'xp'])
            ->map(function ($user) {
                return [
                    'username' => $user->display_name,
                    'xp' => $user->xp,
                    'level' => floor($user->xp / 100) + 1,
                ];
            });

        // Latest Submissions
        $latest = Submission::with('user')
            ->latest()
            ->take(100)
            ->get();

        $formatSub = function($sub) {
            return [
                'id' => $sub->id,
                'title' => $sub->title,
                'category' => $sub->category,
                'media_url' => $sub->media_path ? asset('storage/' . $sub->media_path) : null,
                'author_name' => $sub->user->display_name ?? 'Anonymous',
                'user_id' => $sub->user_id,
                'total_votes' => $sub->votes()->count(),
                'comments_count' => $sub->comments()->count(),
                'reposts_count' => $sub->reposts()->count(),
            ];
        };

        $topVoted = Submission::with(['user', 'votes'])
            ->withCount('votes')
            ->orderByDesc('votes_count')
            ->take(3)
            ->get()
            ->map($formatSub);

        $topCommented = Submission::with(['user', 'comments'])
            ->withCount('comments')
            ->orderByDesc('comments_count')
            ->take(3)
            ->get()
            ->map($formatSub);

        $topReposted = Submission::with(['user', 'reposts'])
            ->withCount('reposts')
            ->orderByDesc('reposts_count')
            ->take(3)
            ->get()
            ->map($formatSub);

        $formattedLatest = $latest->map($formatSub);

        $topUser = User::orderByDesc('xp')->first();
        $featuredUser = null;
        if ($topUser) {
            $focusSector = $topUser->focus_sector;
            $subjectXp = $topUser->getSubjectXp($focusSector);
            
            // Calculate Synergy Match if user is logged in
            $matchReport = null;
            if (auth('sanctum')->check()) {
                $currentUser = auth('sanctum')->user();
                if ($currentUser->id !== $topUser->id) {
                    $overlapXp = $currentUser->getSubjectXp($focusSector);
                    $totalXp = $currentUser->xp + $topUser->xp;
                    $synergy = $totalXp > 0 ? floor(($overlapXp / ($currentUser->xp ?: 1)) * 100) : 0;
                    $matchReport = [
                        'synergy' => min($synergy, 100),
                        'shared_sector' => $focusSector,
                        'message' => $synergy > 70 ? "High Strategic Alignment" : ($synergy > 30 ? "Partial Sync" : "New Perspective")
                    ];
                }
            }

            $featuredUser = [
                'id' => $topUser->id,
                'username' => $topUser->display_name,
                'bio' => $topUser->bio ?? 'Premier contributor in the decentralized network.',
                'xp' => $topUser->xp,
                'level' => floor($topUser->xp / 100) + 1,
                'followers' => $topUser->followers()->count(),
                'following' => $topUser->following()->count(),
                'submissions_count' => $topUser->submissions()->count(),
                'focus_sector' => $focusSector,
                'subject_xp' => $subjectXp,
                'match_report' => $matchReport
            ];
        }

        return response()->json([
            'stats' => [
                'totalDevelopers' => User::count(),
                'totalSubmissions' => Submission::count(),
                'totalVotes' => Vote::count(),
            ],
            'leaderboard' => $leaderboard,
            'latest' => $formattedLatest,
            'topVoted' => $topVoted,
            'topCommented' => $topCommented,
            'topReposted' => $topReposted,
            'featuredUser' => $featuredUser,
        ]);
    }
}
