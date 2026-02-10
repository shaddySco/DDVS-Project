<?php
namespace App\Http\Controllers;

use App\Models\Submission;
use App\Services\GitHubService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubmissionController extends Controller
{
    private $reputationService;

    public function __construct(\App\Services\ReputationService $reputationService)
    {
        $this->reputationService = $reputationService;
    }

    public function store(Request $request)
    {
        // 1. Validation with detailed messages
        $validated = $request->validate([
            'title' => 'required|string|min:3|max:255',
            'category' => 'required|string|in:Machine Learning,Web Development,Blockchain / Web3,Cybersecurity,Mobile Apps,AI / Data Science,Other',
            'description' => 'required|string|min:10',
            'repository_url' => 'required|url',
            'github_username' => 'nullable|string',
            'media' => 'nullable|file|max:51200'
        ], [
            'title.required' => 'Project title is required.',
            'title.min' => 'Project title must be at least 3 characters long.',
            'category.required' => 'Category is required.',
            'category.in' => 'Please select a valid category.',
            'description.required' => 'Description is required.',
            'description.min' => 'Description must be at least 10 characters long.',
            'repository_url.required' => 'Repository URL is required.',
            'repository_url.url' => 'Please enter a valid URL (e.g., https://github.com/...)',
            'media.file' => 'Media must be a file.',
            'media.max' => 'Media file size cannot exceed 50MB.'
        ]);

        // 2. Validate GitHub repository if URL provided
        $githubValidation = null;
        if ($request->filled('repository_url')) {
            try {
                $githubService = new GitHubService();
                $githubValidation = $githubService->validateRepository($request->repository_url);

                // If validation fails, return error
                if (!$githubValidation['valid']) {
                    $errorMessage = $githubValidation['error'] ?? 'The repository URL may be invalid or private. Please ensure it is a valid, publicly accessible GitHub repository.';
                    
                    // Provide more specific error messages for common issues
                    if (strpos($errorMessage, 'SSL') !== false || strpos($errorMessage, 'certificate') !== false) {
                        $errorMessage = 'GitHub API connection issue. Please try again in a moment.';
                    } elseif (strpos($errorMessage, 'timeout') !== false) {
                        $errorMessage = 'GitHub API is taking too long to respond. Please try again.';
                    }
                    
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid or inaccessible GitHub repository',
                        'details' => $errorMessage
                    ], 422);
                }

                // If GitHub username provided, verify contributions
                if ($request->filled('github_username')) {
                    $credibility = $githubService->verifySubmissionCredibility(
                        $request->repository_url,
                        $request->github_username
                    );

                    if (!$credibility['valid']) {
                        $errorMessage = $credibility['error'] ?? 'Could not verify your GitHub contributions to this repository.';
                        
                        // Provide more specific error messages for common issues
                        if (strpos($errorMessage, 'SSL') !== false || strpos($errorMessage, 'certificate') !== false) {
                            $errorMessage = 'GitHub API connection issue while verifying contributions. Please try again.';
                        } elseif (strpos($errorMessage, 'timeout') !== false) {
                            $errorMessage = 'GitHub API is taking too long to respond while verifying contributions. Please try again.';
                        }
                        
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Could not verify GitHub contributions',
                            'details' => $errorMessage
                        ], 422);
                    }

                    $githubValidation = $credibility;
                }
            } catch (\Exception $e) {
                // Catch any unexpected errors during GitHub validation
                return response()->json([
                    'status' => 'error',
                    'message' => 'GitHub validation failed',
                    'details' => 'Unable to validate the GitHub repository at this time. Please try again later.'
                ], 422);
            }
        }

        // 3. Handle File Upload
        $path = null;
        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('projects', 'public');
        }

        // Save GitHub username to user profile if provided and not already set
        $user = Auth::user();
        if ($request->filled('github_username') && (!$user->github_username || $user->github_username !== $request->github_username)) {
            $user->update(['github_username' => $request->github_username]);
        }

        // 4. Create Database Entry
        $submission = Submission::create([
            'user_id' => Auth::id(), // Automatically get the logged-in user ID
            'title' => $request->title,
            'category' => $request->category,
            'description' => $request->description,
            'repository_url' => $request->repository_url,
            'media_path' => $path,
            'verification_message' => $githubValidation['credibility_score'] ?? null,
        ]);

        // 5. Return the ID (The frontend needs this to register on Blockchain)
        return response()->json([
            'status' => 'success',
            'id' => $submission->id,
            'project' => $submission,
            'github_validation' => $githubValidation ? [
                'valid' => $githubValidation['valid'] ?? false,
                'credible' => $githubValidation['credible'] ?? false,
                'credibility_score' => $githubValidation['credibility_score'] ?? 0,
                'repository_info' => $githubValidation['repository'] ?? null,
                'contributions' => [
                    'commits_count' => $githubValidation['contributions']['commits_count'] ?? 0,
                    'has_contributions' => $githubValidation['contributions']['has_contributions'] ?? false,
                ] ?? null,
            ] : null,
        ], 201);
        
    }

    public function verify(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);
        
        $alreadyVerified = $submission->ownership_status === 'verified';

        $submission->update([
            'transaction_hash' => $request->tx_hash,
            'ownership_status' => 'verified',
            'verified_at' => now()
        ]);

        // Award XP/SP points only if first time verified
        if (!$alreadyVerified) {
            $this->reputationService->awardXpForSubmission($submission);
        }

        return response()->json(['status' => 'verified']);
    }

    public function show($id)
    {
        // Find project and include necessary relationships
        $submission = Submission::with(['user', 'votes', 'comments', 'reposts'])->find($id);

        if (!$submission) {
            return response()->json(['message' => 'Project not found'], 404);
        }

        // Check if the current user has voted
        $hasVoted = false;
        if (auth('sanctum')->check()) {
            $hasVoted = $submission->votes()->where('voter_id', auth('sanctum')->id())->exists();
        }

        // Format the response to match your frontend needs
        return response()->json([
            'id' => $submission->id,
            'title' => $submission->title,
            'category' => $submission->category,
            'description' => $submission->description,
            'repository_url' => $submission->repository_url,
            'media_url' => $submission->media_path 
                ? (str_starts_with($submission->media_path, 'images/') || str_starts_with($submission->media_path, '/images/') 
                    ? asset($submission->media_path) 
                    : asset('storage/' . $submission->media_path)) 
                : null,
            'transaction_hash' => $submission->transaction_hash,
            'author' => [
                'id' => $submission->user->id ?? null,
                'username' => $submission->user->display_name ?? 'Unknown Architect',
                'xp' => $submission->user->xp ?? 0,
                'level' => $submission->user->level ?? 1,
                'developer_type' => $submission->user->developer_type ?? 'Developer',
            ],
            'user_id' => $submission->user_id,
            'ownership_status' => $submission->ownership_status ?? 'pending',
            'attestation_hash' => $submission->attestation_hash,
            'verified_at' => $submission->verified_at ? $submission->verified_at->toFormattedDateString() : null,
            'total_votes' => $submission->votes()->count(),
            'comments_count' => $submission->comments()->count(),
            'reposts_count' => $submission->reposts()->count(),
            'has_voted' => $hasVoted,
            'created_at' => $submission->created_at->toFormattedDateString(),
        ]);
    }

    public function index(Request $request)
{
    $query = Submission::with('user')
        ->where('ownership_status', 'verified'); // Only show verified projects in community feed

    // Handle search if provided
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%$search%")
              ->orWhere('category', 'like', "%$search%");
        });
    }

    // Handle Category Filter
    if ($request->has('category') && $request->category !== 'All Categories') {
        $query->where('category', $request->category);
    }

    // Handle Tabs (Following vs Global)
    if ($request->type === 'following' && auth()->check()) {
        $submissions = $query->whereIn('user_id', auth()->user()->following()->pluck('id'))->latest()->get();
    } else {
        $submissions = $query->latest()->get();
    }

    return $this->formatSubmissions($submissions);
}

// Added missing method for Dashboard
public function mySubmissions()
{
    $submissions = Submission::with('user')
        ->where('user_id', Auth::id())
        ->latest()
        ->get();

    return $this->formatSubmissions($submissions);
}

// Helper to avoid code duplication
private function formatSubmissions($submissions)
{
    return response()->json($submissions->map(function($sub) {
        $hasVoted = false;
        if (auth('sanctum')->check()) {
            $hasVoted = $sub->votes()->where('voter_id', auth('sanctum')->id())->exists();
        }

        return [
            'id' => $sub->id,
            'title' => $sub->title,
            'category' => $sub->category,
            'description' => $sub->description,
            'author_name' => $sub->user->display_name ?? 'Unknown Developer',
            'user_id' => $sub->user_id,
            'media_url' => $sub->media_path 
                ? (str_starts_with($sub->media_path, 'images/') || str_starts_with($sub->media_path, '/images/') 
                    ? asset($sub->media_path) 
                    : asset('storage/' . $sub->media_path)) 
                : null,
            'total_votes' => $sub->votes()->count(),
            'comments_count' => $sub->comments()->count(),
            'reposts_count' => $sub->reposts()->count(),
            'has_voted' => $hasVoted,
            'created_at' => $sub->created_at->toFormattedDateString(),
            'ownership_status' => $sub->ownership_status,
        ];
    }));
}
}