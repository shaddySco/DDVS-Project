<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\PublicVerificationController;
/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/auth/me', [AuthController::class, 'me']);

/*
|--------------------------------------------------------------------------
| Public Read-Only Routes
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Submission Routes
|--------------------------------------------------------------------------
*/

// Public
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::post(
    '/submissions/{submission}/verify',
    [SubmissionController::class, 'verify']
);
// Authenticated (STATIC ROUTES FIRST)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::post('/votes', [VoteController::class, 'store']);

    // Phase 6.1
    Route::post(
        '/submissions/{submission}/verification-message',
        [VerificationController::class, 'generateMessage']
    );

    Route::post(
        '/submissions/{submission}/verify-ownership',
        [VerificationController::class, 'verifyOwnership']
    );
});

// Public (PARAMETERIZED LAST)



    Route::post(
        '/submissions/{submission}/verify-ownership',
        [VerificationController::class, 'verifyOwnership']
    );

    Route::middleware('auth:sanctum')->group(function () {
    Route::post(
        '/submissions/{submission}/dispute',
        [DisputeController::class, 'store']
    );
});
Route::post(
    '/disputes/{dispute}/resolve',
    [DisputeController::class, 'resolve']
)->middleware('auth:sanctum');

//phase 7.4
Route::get('/submissions/{submission}/proof', function (\App\Models\Submission $submission) {
    abort_unless($submission->ownership_status === 'verified', 404);

    return response()->json([
        'submission_id' => $submission->id,
        'wallet_address' => $submission->user->wallet_address,
        'verified_at' => $submission->verified_at,
        'attestation_hash' => $submission->attestation_hash,
    ]);
});

Route::get(
    '/public/verify/{id}',
    [PublicVerificationController::class, 'show']
);

Route::get(
    '/verify/{submission}',
    [PublicVerificationController::class, 'show']
);
