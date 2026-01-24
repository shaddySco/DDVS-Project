<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function toggle(User $user)
    {
        $follower = Auth::user();
        
        if ($follower->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself'], 400);
        }

        if ($follower->following()->where('followed_id', $user->id)->exists()) {
            $follower->following()->detach($user->id);
            return response()->json(['followed' => false, 'message' => 'Unfollowed']);
        }

        $follower->following()->attach($user->id);
        return response()->json(['followed' => true, 'message' => 'Followed']);
    }

    public function status(User $user)
    {
        $isFollowing = Auth::user()->following()->where('followed_id', $user->id)->exists();
        return response()->json(['is_following' => $isFollowing]);
    }
}
