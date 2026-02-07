<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\Repost;
use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
   

public function index(Request $request) {
    $submissions = Submission::with('user')->latest()->get();

    return $submissions->map(function($sub) {
        return [
            'id' => $sub->id,
            'title' => $sub->title,
            'category' => $sub->category,
            'repo_url' => $sub->repository_url, // 👈 MAKE SURE THIS IS HERE
            'author_name' => $sub->user->username ?? $sub->user->name,
            'user_id' => $sub->user_id,
            'total_votes' => $sub->votes_count ?? 0,
            // ...
        ];
    });
}
  
    public function feed(Request $request)
    {
        $user = auth('sanctum')->user();
        $type = $request->query('type', 'global');
        $search = $request->query('search');
        $category = $request->query('category');

        // 1. Base query for Submissions
        $submissionsQuery = Submission::with(['user', 'votes', 'comments', 'reposts'])
            ->where('ownership_status', 'verified');

        // 2. Base query for Reposts
        $repostsQuery = Repost::with(['submission.user', 'user', 'submission.votes', 'submission.comments', 'submission.reposts'])
            ->whereHas('submission', function($q) {
                $q->where('ownership_status', 'verified');
            });

        // 3. Filters
        if ($type === 'connections' && $user) {
            $followingIds = $user->following()->pluck('id');
            $followerIds = $user->followers()->pluck('id');
            $connectionIds = $followingIds->concat($followerIds)->push($user->id)->unique();

            $submissionsQuery->whereIn('user_id', $connectionIds);
            $repostsQuery->whereIn('user_id', $connectionIds);
        }

        if ($search) {
            $submissionsQuery->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
            $repostsQuery->whereHas('submission', function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'All Categories') {
            $submissionsQuery->where('category', $category);
            $repostsQuery->whereHas('submission', function($q) use ($category) {
                $q->where('category', $category);
            });
        }

        // 4. Fetch and Combine
        $submissions = $submissionsQuery->latest()->get()->map(function($sub) {
            return $this->formatFeedItem($sub, false);
        });

        $reposts = $repostsQuery->latest()->get()->map(function($repost) {
            return $this->formatFeedItem($repost->submission, true, $repost);
        });

        // 5. Merge and Sort
        $combined = $submissions->concat($reposts)
            ->sortByDesc('sort_date')
            ->values();

        return response()->json($combined);
    }

    private function formatFeedItem($sub, $isRepost, $repostObject = null)
    {
        $hasVoted = false;
        if (auth('sanctum')->check()) {
            $hasVoted = $sub->votes()->where('voter_id', auth('sanctum')->id())->exists();
        }

        return [
            'id' => $sub->id,
            'title' => $sub->title,
            'category' => $sub->category,
            'description' => $sub->description,
            'author_name' => $sub->user->display_name ?? 'Unknown Developer',
            'user_id' => $sub->user_id,
            'media_url' => $sub->media_path 
                ? (str_starts_with($sub->media_path, 'images/') || str_starts_with($sub->media_path, '/images/') 
                    ? asset($sub->media_path) 
                    : asset('storage/' . $sub->media_path)) 
                : null,
            'total_votes' => $sub->votes->count(),
            'comments_count' => $sub->comments->count(),
            'reposts_count' => $sub->reposts->count(),
            'has_voted' => $hasVoted,
            'created_at' => $sub->created_at->toFormattedDateString(),
            'sort_date' => $isRepost ? $repostObject->created_at : $sub->created_at,
            'is_repost' => $isRepost,
            'reposted_by_name' => $isRepost ? ($repostObject->user->display_name ?? 'Someone') : null,
            'reposted_at' => $isRepost ? $repostObject->created_at->diffForHumans() : null,
        ];
    }


    /**
     * -------------------------------
     * STORE COMMENT
     * -------------------------------
     */
    public function storeComment(Request $request)
    {
        $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'content' => 'required|string',
        ]);

        $comment = Comment::create([
            'submission_id' => $request->submission_id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return response()->json($comment, 201);
    }

    /**
     * -------------------------------
     * LIKE COMMENT (IDEMPOTENT)
     * -------------------------------
     */
    public function likeComment(Comment $comment, Request $request)
    {
        CommentLike::firstOrCreate([
            'comment_id' => $comment->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'liked' => true,
            'likes_count' => $comment->likes()->count(),
        ]);
    }

    /**
     * -------------------------------
     * REPOST SUBMISSION
     * -------------------------------
     */
    public function repost(Submission $submission, Request $request)
    {
        $user = $request->user();

        // Prevent reposting own submission
        if ($submission->user_id === $user->id) {
            return response()->json([
                'message' => 'You cannot repost your own submission',
            ], 403);
        }

        $repost = Repost::firstOrCreate([
            'submission_id' => $submission->id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'reposted' => true,
            'repost_id' => $repost->id,
        ], 201);
    }
}
