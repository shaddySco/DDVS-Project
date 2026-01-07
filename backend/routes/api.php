<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\PublicVerificationController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentLikeController;
use App\Http\Controllers\RepostController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login']);
// routes/api.php
Route::get('/auth/me', [AuthController::class, 'me'])
    ->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Public Read-Only Routes
|--------------------------------------------------------------------------
*/

Route::get('/landing', [LandingController::class, 'stats']);
Route::get('/community', [CommunityController::class, 'feed']);
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::get('/submissions/{id}/comments', [CommentController::class, 'index']);

Route::get('/public/verify/{id}', [PublicVerificationController::class, 'show']);
Route::get('/verify/{submission}', [PublicVerificationController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Submissions
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
    Route::post('/submissions', [SubmissionController::class, 'store']);

    // Voting
    Route::post('/votes', [VoteController::class, 'store']);

    // Ownership verification
    Route::post(
        '/submissions/{submission}/verification-message',
        [VerificationController::class, 'generateMessage']
    );

    Route::post(
        '/submissions/{submission}/verify-ownership',
        [VerificationController::class, 'verifyOwnership']
    );

    // Disputes
    Route::post('/submissions/{submission}/dispute', [DisputeController::class, 'store']);
    Route::post('/disputes/{dispute}/resolve', [DisputeController::class, 'resolve']);

    // Comments
    Route::post('/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/like', [CommentLikeController::class, 'toggle']);

    // Reposts
    Route::post('/submissions/{submission}/repost', [RepostController::class, 'store']);

    // Profile feed
    Route::get('/profile/{wallet}/feed', [ProfileController::class, 'feed']);
});

/*
|--------------------------------------------------------------------------
| Public Proof Endpoint
|--------------------------------------------------------------------------
*/

Route::get('/submissions/{submission}/proof', function (\App\Models\Submission $submission) {
    abort_unless($submission->ownership_status === 'verified', 404);

    return response()->json([
        'submission_id'     => $submission->id,
        'wallet_address'    => $submission->user->wallet_address,
        'verified_at'       => $submission->verified_at,
        'attestation_hash'  => $submission->attestation_hash,
    ]);
});
