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
    /**
     * MAIN COMMUNITY FEED
     *
     * Returns a unified feed of:
     * - Original submissions
     * - Reposts (clearly marked)
     *
     * Supports:
     * - Global feed
     * - Following feed
     * - Pagination
     */
public function feed(Request $request)
{
    $user = $request->user();
    $type = $request->query('type', 'global');

    $submissions = Submission::query()
        ->select([
            DB::raw("CONCAT('submission-', submissions.id) as feed_id"),
            'submissions.id',
            'submissions.user_id',
            'submissions.title',
            'submissions.description',
            'submissions.created_at',
            DB::raw('(SELECT COUNT(*) FROM comments WHERE comments.submission_id = submissions.id) as comments_count'),
            DB::raw('(SELECT COUNT(*) FROM votes WHERE votes.submission_id = submissions.id) as total_votes'),
            DB::raw('(SELECT COUNT(*) FROM reposts WHERE reposts.submission_id = submissions.id) as reposts_count'),
            DB::raw('false as is_repost'),
            DB::raw('null as reposted_by'),
            DB::raw('null as reposted_at'),
        ]);

    $reposts = Repost::query()
        ->join('submissions', 'reposts.submission_id', '=', 'submissions.id')
        ->select([
            DB::raw("CONCAT('repost-', reposts.id) as feed_id"),
            'submissions.id',
            'submissions.user_id',
            'submissions.title',
            'submissions.description',
            'reposts.created_at',
            DB::raw('(SELECT COUNT(*) FROM comments WHERE comments.submission_id = submissions.id) as comments_count'),
            DB::raw('(SELECT COUNT(*) FROM votes WHERE votes.submission_id = submissions.id) as total_votes'),
            DB::raw('(SELECT COUNT(*) FROM reposts WHERE reposts.submission_id = submissions.id) as reposts_count'),
            DB::raw('true as is_repost'),
            'reposts.user_id as reposted_by',
            'reposts.created_at as reposted_at',
        ]);

    if ($type === 'following' && $user) {
$followedIds = $user->following()->pluck('user_id');        $submissions->whereIn('submissions.user_id', $followedIds);
        $reposts->whereIn('reposts.user_id', $followedIds);
    }

    $union = $submissions->unionAll($reposts);

    $feed = DB::query()
        ->fromSub($union, 'feed')
        ->orderByDesc('created_at')
        ->paginate(10);

    return response()->json($feed);
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
