<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;


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

    public function me(Request $request)
{
    return response()->json($request->user());
}

}
