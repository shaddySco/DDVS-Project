<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Services\AttestationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use kornrunner\Keccak;
use kornrunner\Secp256k1;

class VerificationController extends Controller
{
    /**
     * Generate ownership verification message
     */
    public function generateMessage(Submission $submission): JsonResponse
    {
        if ($submission->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized verification attempt.'
            ], Response::HTTP_FORBIDDEN);
        }

        $message = sprintf(
            "DDVS Ownership Verification\nSubmission ID: %d\nWallet: %s",
            $submission->id,
            Auth::user()->wallet_address
        );

        $submission->update([
            'verification_message' => $message,
        ]);

        return response()->json([
            'message' => $message
        ]);
    }

    /**
     * Verify ownership + trigger Phase 7.3 attestation
     */
    public function verifyOwnership(
        Request $request,
        Submission $submission
    ): JsonResponse {
        if ($submission->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized verification attempt.'
            ], Response::HTTP_FORBIDDEN);
        }

        $request->validate([
            'signature'   => 'required|string',
            'proof_path'  => 'required|string',
        ]);

        if (!$submission->verification_message) {
            return response()->json([
                'message' => 'Verification message not generated.'
            ], Response::HTTP_BAD_REQUEST);
        }

        // 🔐 Recover wallet from signature
        $recoveredAddress = $this->recoverWalletAddress(
            $submission->verification_message,
            $request->signature
        );

        if (
            !$recoveredAddress ||
            strtolower($recoveredAddress) !== strtolower(Auth::user()->wallet_address)
        ) {
            return response()->json([
                'message' => 'Signature does not match authenticated wallet.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 🧾 Verify GitHub proof
        if (!$this->verifyGithubProof(
            $submission->repository_url,
            $request->proof_path,
            $submission->verification_message,
            $request->signature
        )) {
            return response()->json([
                'message' => 'GitHub proof verification failed.'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // ✅ Phase 6 — Trust verification
        $submission->update([
            'verification_signature' => $request->signature,
            'verification_path'      => $request->proof_path,
            'ownership_status'       => 'verified',
            'verified_at'            => now(),
        ]);

        // 🟢 Phase 7.3 — Cryptographic Attestation (deterministic)
        $attestationHash = app(AttestationService::class)->generate(
            Auth::user()->wallet_address,
            $submission->id,
            $submission->verified_at,
            $submission->repository_url
        );

        $submission->update([
            'attestation_hash' => $attestationHash,
        ]);

        return response()->json([
            'message'           => 'Submission ownership verified successfully.',
            'attestation_hash'  => $attestationHash,
        ]);
    }

    /**
     * Recover Ethereum wallet address from signed message
     */
    protected function recoverWalletAddress(
        string $message,
        string $signature
    ): ?string {
        try {
            $msg = "\x19Ethereum Signed Message:\n" . strlen($message) . $message;
            $msgHash = Keccak::hash($msg, 256);

            $sig = hex2bin(substr($signature, 2));
            $r = substr($sig, 0, 32);
            $s = substr($sig, 32, 32);
            $v = ord(substr($sig, 64, 1));

            if ($v < 27) {
                $v += 27;
            }

            $publicKey = Secp256k1::recoverPublicKey($msgHash, [
                'r' => bin2hex($r),
                's' => bin2hex($s),
                'v' => $v,
            ]);

            return '0x' . substr(
                Keccak::hash(hex2bin(substr($publicKey, 2)), 256),
                24
            );
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Verify GitHub proof file existence and contents
     */
    protected function verifyGithubProof(
        string $repoUrl,
        string $proofPath,
        string $message,
        string $signature
    ): bool {
        if (!preg_match('#github\.com/([^/]+)/([^/]+)#', $repoUrl, $matches)) {
            return false;
        }

        [, $owner, $repo] = $matches;

        $rawUrl = "https://raw.githubusercontent.com/{$owner}/{$repo}/main/{$proofPath}";

        $response = Http::timeout(10)->get($rawUrl);

        if (!$response->ok()) {
            return false;
        }

        $content = $response->body();

        return Str::contains($content, $message)
            && Str::contains($content, $signature);
    }
}
