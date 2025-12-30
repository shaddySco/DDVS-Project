<?php
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\AuthController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/submissions', [SubmissionController::class, 'store']);
    Route::get('/submissions/mine', [SubmissionController::class, 'mySubmissions']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/votes', [VoteController::class, 'store']);
});
