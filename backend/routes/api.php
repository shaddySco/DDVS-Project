<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubmissionController;

// Public API routes (Demo – no auth yet)
Route::post('/submit', [SubmissionController::class, 'store']);
Route::get('/feed', [SubmissionController::class, 'index']);
