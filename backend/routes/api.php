<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\VerificationController;
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
Route::get('/submissions/{submission}', [SubmissionController::class, 'show']);



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
