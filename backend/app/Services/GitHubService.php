<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Exception;

class GitHubService
{
    private string $baseUrl = 'https://api.github.com';
    private ?string $token;

    public function __construct()
    {
        $this->token = config('services.github.token');
    }

    /**
     * Validate GitHub repository exists and is accessible
     */
    public function validateRepository(string $repoUrl): array
    {
        try {
            $owner = $this->extractOwner($repoUrl);
            $repo = $this->extractRepo($repoUrl);

            if (!$owner || !$repo) {
                throw new Exception('Invalid GitHub URL format');
            }

            $response = Http::withHeaders($this->getHeaders())
                ->withOptions([
                    'verify' => false, // Disable SSL verification for development
                    'timeout' => 30,
                ])
                ->get("{$this->baseUrl}/repos/{$owner}/{$repo}");

            if (!$response->successful()) {
                throw new Exception('Repository not found or not accessible');
            }

            $data = $response->json();

            return [
                'valid' => true,
                'owner' => $owner,
                'repo' => $repo,
                'full_name' => $data['full_name'] ?? '',
                'url' => $data['html_url'] ?? $repoUrl,
                'description' => $data['description'] ?? '',
                'stars' => $data['stargazers_count'] ?? 0,
                'language' => $data['language'] ?? 'Unknown',
                'is_fork' => $data['fork'] ?? false,
            ];
        } catch (Exception $e) {
            return [
                'valid' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get user commits in a repository
     */
    public function getUserCommits(string $repoUrl, string $githubUsername): array
    {
        try {
            $owner = $this->extractOwner($repoUrl);
            $repo = $this->extractRepo($repoUrl);

            if (!$owner || !$repo) {
                throw new Exception('Invalid repository URL');
            }

            // Get commits by user
            $response = Http::withHeaders($this->getHeaders())
                ->withOptions([
                    'verify' => false, // Disable SSL verification for development
                    'timeout' => 30,
                ])
                ->get("{$this->baseUrl}/repos/{$owner}/{$repo}/commits", [
                    'author' => $githubUsername,
                    'per_page' => 100,
                ]);

            if (!$response->successful()) {
                return [
                    'valid' => false,
                    'commits_count' => 0,
                    'error' => 'Could not retrieve commits',
                ];
            }

            $commits = $response->json();
            $commitCount = count($commits);

            return [
                'valid' => true,
                'commits_count' => $commitCount,
                'has_contributions' => $commitCount > 0,
                'recent_commit' => $commits[0]['commit']['author']['date'] ?? null,
            ];
        } catch (Exception $e) {
            return [
                'valid' => false,
                'commits_count' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get GitHub user information
     */
    public function getGitHubUser(string $username): array
    {
        try {
            $response = Http::withHeaders($this->getHeaders())
                ->withOptions([
                    'verify' => false, // Disable SSL verification for development
                    'timeout' => 30,
                ])
                ->get("{$this->baseUrl}/users/{$username}");

            if (!$response->successful()) {
                throw new Exception('GitHub user not found');
            }

            $user = $response->json();

            return [
                'valid' => true,
                'username' => $user['login'] ?? $username,
                'name' => $user['name'] ?? '',
                'avatar_url' => $user['avatar_url'] ?? '',
                'bio' => $user['bio'] ?? '',
                'public_repos' => $user['public_repos'] ?? 0,
                'followers' => $user['followers'] ?? 0,
                'following' => $user['following'] ?? 0,
                'verified' => true,
            ];
        } catch (Exception $e) {
            return [
                'valid' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify submission contains real commits
     */
    public function verifySubmissionCredibility(string $repoUrl, string $githubUsername): array
    {
        try {
            // Validate repo exists
            $repoValidation = $this->validateRepository($repoUrl);
            if (!$repoValidation['valid']) {
                return $repoValidation;
            }

            // Check user has commits
            $commits = $this->getUserCommits($repoUrl, $githubUsername);
            if (!$commits['valid']) {
                return $commits;
            }

            // Get user info
            $userInfo = $this->getGitHubUser($githubUsername);
            if (!$userInfo['valid']) {
                return $userInfo;
            }

            // Calculate credibility score (0-100)
            $credibilityScore = $this->calculateCredibilityScore(
                $repoValidation,
                $commits,
                $userInfo
            );

            return [
                'valid' => true,
                'credible' => $credibilityScore >= 50,
                'credibility_score' => $credibilityScore,
                'repository' => $repoValidation,
                'contributions' => $commits,
                'github_user' => $userInfo,
            ];
        } catch (Exception $e) {
            return [
                'valid' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Calculate credibility score based on various factors
     */
    private function calculateCredibilityScore(array $repo, array $commits, array $user): int
    {
        $score = 0;

        // Repo factors (max 40 points)
        if (!$repo['is_fork']) {
            $score += 15; // Original repo is more credible
        }
        $score += min(25, ($repo['stars'] ?? 0) / 4); // Stars contribute up to 25 points

        // Contribution factors (max 40 points)
        $commitCount = $commits['commits_count'] ?? 0;
        if ($commitCount > 0) {
            $score += min(40, $commitCount * 2); // More commits = higher score
        }

        // User factors (max 20 points)
        $followerCount = $user['followers'] ?? 0;
        if ($followerCount > 0) {
            $score += min(20, $followerCount / 5);
        }
        if ($user['public_repos'] ?? 0 > 5) {
            $score += 10; // Established contributor
        }

        return min(100, (int)$score);
    }

    /**
     * Extract owner from GitHub URL
     */
    private function extractOwner(string $url): ?string
    {
        // Support multiple URL formats
        $patterns = [
            '/github\.com\/([^\/]+)\//i',
            '/^([^\/]+)\/[^\/]+$/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract repo name from GitHub URL
     */
    private function extractRepo(string $url): ?string
    {
        // Support multiple URL formats
        $patterns = [
            '/github\.com\/[^\/]+\/([^\/]+?)(?:\.git)?$/i',
            '/^[^\/]+\/([^\/]+)$/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Get headers for API requests
     */
    private function getHeaders(): array
    {
        $headers = [
            'Accept' => 'application/vnd.github.v3+json',
        ];

        if ($this->token) {
            $headers['Authorization'] = "token {$this->token}";
        }

        return $headers;
    }
}
