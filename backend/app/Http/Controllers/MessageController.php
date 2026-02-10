<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index(Request $request, User $user)
    {
        $currentUserId = Auth::id();
        $otherUserId = $user->id;

        $messages = Message::where(function ($query) use ($currentUserId, $otherUserId) {
            $query->where('sender_id', $currentUserId)
                  ->where('receiver_id', $otherUserId);
        })->orWhere(function ($query) use ($currentUserId, $otherUserId) {
            $query->where('sender_id', $otherUserId)
                  ->where('receiver_id', $currentUserId);
        })->orderBy('created_at', 'asc')
        ->get();

        return response()->json($messages);
    }

    public function store(Request $request, User $user)
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'content' => $request->content,
        ]);

        // Create notification for the receiver
        Notification::create([
            'user_id' => $user->id,
            'type' => 'message',
            'message' => 'You have a new message from ' . Auth::user()->username,
            'data' => ['sender_id' => Auth::id()],
        ]);

        return response()->json($message, 201);
    }

    public function conversations()
    {
        $userId = Auth::id();

        // Get unique users who have messaged the current user or been messaged by them
        $senders = Message::where('receiver_id', $userId)->pluck('sender_id');
        $receivers = Message::where('sender_id', $userId)->pluck('receiver_id');

        $userIds = $senders->merge($receivers)->unique();

        $users = User::whereIn('id', $userIds)->get()->map(function($user) {
            return [
                'id' => $user->id,
                'username' => $user->display_name,
            ];
        });

        return response()->json($users);
    }
}
