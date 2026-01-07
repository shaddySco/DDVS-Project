<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($submissionId)
    {
        return Comment::with(['user:id,username,xp'])
            ->withCount('likes')
            ->where('submission_id', $submissionId)
            ->latest()
            ->get();
    }

  public function store(Request $request)
{
    $request->validate([
        'submission_id' => 'required|exists:submissions,id',
        'content' => 'required|string|max:1000',
    ]);

    $user = $request->user() ?? \App\Models\User::first();

    return Comment::create([
        'submission_id' => $request->submission_id,
        'user_id' => $user->id,
        'content' => $request->content,
    ]);
}

    public function like(Comment $comment, Request $request)
    {
        CommentLike::firstOrCreate([
            'comment_id' => $comment->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['liked' => true]);
    }
}
