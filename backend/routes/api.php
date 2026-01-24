<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
    AuthController, SubmissionController, VoteController, DisputeController,
    VerificationController, PublicVerificationController, LandingController,
    CommunityController, CommentController, CommentLikeController,
    RepostController, ProfileController, UserController, FollowController,
    MessageController
};

/* --- Public Routes --- */
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/landing', [LandingController::class, 'stats']);
Route::get('/community', [CommunityController::class, 'feed']);
Route::get('/submissions', [SubmissionController::class, 'index']);
Route::get('/submissions/{id}', [SubmissionController::class, 'show']);
Route::get('/submissions/{id}/comments', [CommentController::class, 'index']);
Route::get('/verify/{submission}', [PublicVerificationController::class, 'show']);
Route::get('/users/{id}', [UserController::class, 'show']);

/* --- Authenticated Routes --- */
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile
    // User Profile
    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::get('/auth/me', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [ProfileController::class, 'update']);

    // Projects / Submissions
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
    Route::post('/projects', [SubmissionController::class, 'store']); // Used by Submit.jsx
    Route::post('/projects/{id}/verify', [SubmissionController::class, 'verify']);

    // Voting & Interactions
    Route::post('/votes', [VoteController::class, 'store']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::post('/comments/{comment}/like', [CommentLikeController::class, 'toggle']);
    Route::post('/submissions/{submission}/repost', [RepostController::class, 'store']);

    // Social & Verification
    Route::get('/profile/{wallet}/feed', [ProfileController::class, 'feed']);
    Route::post('/users/{user}/follow', [FollowController::class, 'toggle']);
    Route::get('/users/{user}/follow-status', [FollowController::class, 'status']);
    
    // Messaging
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{user}', [MessageController::class, 'index']);
    Route::post('/messages/{user}', [MessageController::class, 'store']);

    Route::post('/submissions/{submission}/verify-ownership', [VerificationController::class, 'verifyOwnership']);
    Route::post('/submissions/{submission}/dispute', [DisputeController::class, 'store']);
});