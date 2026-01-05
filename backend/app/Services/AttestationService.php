<?php

namespace App\Services;

use Illuminate\Support\Str;

class AttestationService
{
    /**
     * Generate deterministic cryptographic attestation hash
     *
     * This does NOT decide trust.
     * It anchors an already verified state.
     */
    public function generate(
        string $wallet,
        int $submissionId,
        string $verifiedAt,
        string $repositoryUrl
    ): string {
        $payload = implode('|', [
            strtolower($wallet),
            $submissionId,
            $verifiedAt,
            $repositoryUrl,
        ]);

        return '0x' . hash('sha256', $payload);
    }
}
