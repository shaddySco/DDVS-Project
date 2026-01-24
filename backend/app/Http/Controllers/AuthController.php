<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'wallet_address' => 'required|string',
        ]);

        $user = User::firstOrCreate(
            ['wallet_address' => $request->wallet_address],
            ['xp' => 0]
        );

        // 🔑 ISSUE SANCTUM TOKEN
        $token = $user->createToken('ddvs-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'id' => $user->id,
            'wallet_address' => $user->wallet_address,
            'xp' => $user->xp,
            'level' => $user->level,
        ]);
    }

}
