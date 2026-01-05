<?php

namespace App\Http\Controllers;

use App\Models\Submission;

class PublicVerificationController extends Controller
{
    public function show(int $id)
    {
        $submission = Submission::with('user')->findOrFail($id);

        if ($submission->ownership_status !== 'verified') {
            return response()->json([
                'verified' => false,
                'message' => 'Submission not verified'
            ], 404);
        }

        return response()->json([
            'verified' => true,
            'submission_id' => $submission->id,
            'wallet' => $submission->user->wallet_address,
            'attestation_hash' => $submission->attestation_hash,
            'verified_at' => $submission->verified_at,
            'repository_url' => $submission->repository_url,
        ]);
    }
}
