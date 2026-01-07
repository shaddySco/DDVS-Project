<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;

class CommentLikeController extends Controller
{
    public function toggle(Request $request, Comment $comment)
    {
        $user = $request->user();

        $existing = CommentLike::where('user_id', $user->id)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            CommentLike::create([
                'user_id' => $user->id,
                'comment_id' => $comment->id,
            ]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $comment->likes()->count()
        ]);
    }
}
