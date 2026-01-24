<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get a public user profile by ID.
     */
    public function show($id)
    {
        $user = User::with([
            'submissions' => function ($query) {
                $query->latest()->limit(10);
            }
        ])->findOrFail($id);

        $focusSector = $user->focus_sector;
        $subjectXp = $user->getSubjectXp($focusSector);

        // Synergy Match Report
        $matchReport = null;
        if (auth('sanctum')->check()) {
            $currentUser = auth('sanctum')->user();
            if ($currentUser->id !== $user->id) {
                $overlapXp = $currentUser->getSubjectXp($focusSector);
                $synergy = $currentUser->xp > 0 ? floor(($overlapXp / $currentUser->xp) * 100) : 0;
                $matchReport = [
                    'synergy' => min($synergy, 100),
                    'shared_sector' => $focusSector,
                    'message' => $synergy > 70 ? "High Strategic Alignment" : ($synergy > 30 ? "Partial Sync" : "New Perspective")
                ];
            }
        }

        return response()->json([
            'id' => $user->id,
            'username' => $user->username ?? 'Anonymous',
            'wallet_address' => $user->wallet_address,
            'bio' => $user->bio,
            'skills' => $user->skills,
            'developer_type' => $user->developer_type,
            'level' => $user->level,
            'xp' => $user->xp,
            'focus_sector' => $focusSector,
            'subject_xp' => $subjectXp,
            'match_report' => $matchReport,
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'submissions' => $user->submissions->map(function($sub) use ($user) {
                return [
                    'id' => $sub->id,
                    'title' => $sub->title,
                    'category' => $sub->category,
                    'description' => $sub->description,
                    'author_name' => $user->username ?? $user->name ?? 'Anonymous',
                    'user_id' => $sub->user_id,
                    'total_votes' => $sub->votes()->count(),
                    'comments_count' => $sub->comments()->count(),
                    'reposts_count' => $sub->reposts()->count(),
                    'has_voted' => false,
                    'created_at' => $sub->created_at->toDateTimeString(),
                ];
            })
        ]);
    }
}
