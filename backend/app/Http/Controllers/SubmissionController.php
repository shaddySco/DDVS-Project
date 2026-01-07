<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Services\AttestationService;

class SubmissionController extends Controller
{
    /**
     * Store a new submission
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'required|string',
            'repository_url' => 'required|url',
        ]);

        $submission = Submission::create([
            'user_id'          => Auth::id(),
            'title'            => $request->title,
            'description'      => $request->description,
            'repository_url'   => $request->repository_url,
            'ownership_status' => 'unverified',
        ]);

        return response()->json(
            $submission,
            Response::HTTP_CREATED
        );
    }

    /**
     * Community feed (public)
     */
    public function index(): JsonResponse
    {
       $submissions = Submission::withCount([
        'votes',
        'comments',
        'reposts'
    ])
->with('author:id,username,wallet_address,xp')
    ->latest()
    ->get();


        return response()->json($submissions);
    }

    /**
     * Single submission view
     */
    public function show(Submission $submission): JsonResponse
    {
        $submission->load([
            'author:id,wallet_address,xp',
            'votes'
        ]);

        return response()->json($submission);
    }

    /**
     * Authenticated user's submissions
     */
    public function mySubmissions(): JsonResponse
    {
        $submissions = Submission::where(
                'user_id',
                Auth::id()
            )
            ->withCount('votes')
            ->latest()
            ->get();

        return response()->json($submissions);

    }


public function verify(Submission $submission): JsonResponse
{
    // Phase 6 — ownership verification
    $submission->ownership_status = 'verified';
    $submission->verified_at = now();
    $submission->save();

    // Phase 7.3 — deterministic attestation
    $attestationHash = app(AttestationService::class)->generate(
        $submission->user->wallet_address,
        $submission->id,
        $submission->verified_at,
        $submission->repository_url
    );

    $submission->attestation_hash = $attestationHash;
    $submission->save();

    return response()->json([
        'message' => 'Submission verified and attested',
        'attestation_hash' => $attestationHash,
    ]);
}


    /**
     * Alias endpoint (optional, safe)
     */
    public function mine(): JsonResponse
    {
        return $this->mySubmissions();
    }
}
