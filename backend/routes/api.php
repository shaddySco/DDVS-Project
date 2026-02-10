<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
    AuthController, SubmissionController, VoteController, DisputeController,
    VerificationController, PublicVerificationController, LandingController,
    CommunityController, CommentController, CommentLikeController,
    RepostController, ProfileController, UserController, FollowController,
    MessageController, NewsController, BadgeTierController, SkillReputationController,
    NotificationController
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
Route::get('/news', [NewsController::class, 'index']); // Public News Feed
Route::get('/news/{id}', [NewsController::class, 'show']);

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

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);

    Route::post('/submissions/{submission}/verify-ownership', [VerificationController::class, 'verifyOwnership']);
    Route::post('/submissions/{submission}/dispute', [DisputeController::class, 'store']);

    // Badge Tier Routes
    Route::get('/badge-tiers/user-tier', [BadgeTierController::class, 'getUserTier']);
    Route::get('/badge-tiers/leaderboard', [BadgeTierController::class, 'getLeaderboard']);
    Route::get('/badge-tiers/all', [BadgeTierController::class, 'getAllTiers']);
    Route::get('/badge-tiers/statistics', [BadgeTierController::class, 'getStatistics']);
    Route::get('/badge-tiers/{tier}/benefits', [BadgeTierController::class, 'getTierBenefits']);
    Route::get('/users/{username}/tier', [BadgeTierController::class, 'getUserTierByUsername']);

    // Skill Reputation Routes
    Route::get('/skills/user-skills', [SkillReputationController::class, 'getUserSkills']);
    Route::get('/skills/category-leaderboard', [SkillReputationController::class, 'getCategoryLeaderboard']);
    Route::get('/skills/popular-categories', [SkillReputationController::class, 'getPopularCategories']);
    Route::get('/skills/category-statistics', [SkillReputationController::class, 'getCategoryStatistics']);
    Route::get('/users/{username}/skills', [SkillReputationController::class, 'getUserSkillsByUsername']);

    // Enhanced Dispute Routes
    Route::post('/disputes/{dispute}/assign-arbitrator', [DisputeController::class, 'assignArbitrator']);
    Route::post('/disputes/{dispute}/resolve', [DisputeController::class, 'resolve']);
    Route::post('/disputes/{dispute}/appeal', [DisputeController::class, 'appeal']);
    Route::post('/disputes/{dispute}/vote', [DisputeController::class, 'voteOnDispute']);
    Route::get('/disputes/pending', [DisputeController::class, 'getPending']);
    Route::get('/disputes/high-priority', [DisputeController::class, 'getHighPriority']);
    Route::get('/arbitrator/metrics', [DisputeController::class, 'getArbitratorMetrics']);

    // Admin News Management
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);
});