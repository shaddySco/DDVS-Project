<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SubmissionController extends Controller
{
    /**
     * Store a new submission.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'repository_url' => 'required|url',
        ]);

        $submission = Submission::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'repository_url' => $request->repository_url,
            'ownership_status' => 'unverified',
        ]);

        return response()->json($submission, Response::HTTP_CREATED);
    }

    /**
     * Community feed.
     */
    public function index(): JsonResponse
    {
        $submissions = Submission::withCount('votes')
            ->with('author:id,wallet_address,xp')
            ->latest()
            ->get();

        return response()->json($submissions);
    }

    /**
     * Single submission view.
     */
    public function show(Submission $submission): JsonResponse
    {
        $submission->load(['author:id,wallet_address,xp', 'votes']);

        return response()->json($submission);
    }

    /**
     * Authenticated user submissions.
     */
    public function mySubmissions(): JsonResponse
    {
        $submissions = Submission::where('user_id', Auth::id())
            ->withCount('votes')
            ->latest()
            ->get();

        return response()->json($submissions);
    }
}
