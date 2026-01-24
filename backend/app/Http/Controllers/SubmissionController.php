<?php
namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubmissionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validation
        $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'repository_url' => 'required|url',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480' // Optional, supports video, larger size
        ]);

        // 2. Handle File Upload
        $path = null;
        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('projects', 'public');
        }

        // 3. Create Database Entry
        $submission = Submission::create([
            'user_id' => Auth::id(), // Automatically get the logged-in user ID
            'title' => $request->title,
            'category' => $request->category,
            'description' => $request->description,
            'repository_url' => $request->repository_url,
            'media_path' => $path,
        ]);

        // 4. Return the ID (The frontend needs this to register on Blockchain)
        return response()->json([
            'status' => 'success',
            'id' => $submission->id,
            'project' => $submission
        ], 201);
        
    }

    public function verify(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);
        $submission->update(['transaction_hash' => $request->tx_hash]);
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
            $hasVoted = $submission->votes()->where('user_id', auth('sanctum')->id())->exists();
        }

        // Format the response to match your frontend needs
        return response()->json([
            'id' => $submission->id,
            'title' => $submission->title,
            'category' => $submission->category,
            'description' => $submission->description,
            'repository_url' => $submission->repository_url,
            'media_url' => $submission->media_path ? asset('storage/' . $submission->media_path) : null,
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
    $query = Submission::with('user'); // Assumes a 'user' relationship in Submission model

    // Handle search if provided
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%$search%")
              ->orWhere('category', 'like', "%$search%");
        });
    }

    // Handle Tabs (Following vs Global)
    if ($request->type === 'following' && auth()->check()) {
        // If you have a followers system, filter here. 
        // For now, let's just return nothing or a subset to show it works.
        $submissions = $query->whereIn('user_id', auth()->user()->following()->pluck('id'))->latest()->get();
    } else {
        // Global: return everything
        $submissions = $query->latest()->get();
    }

    // Format the data to match your frontend keys
    $formatted = $submissions->map(function($sub) {
        $hasVoted = false;
        if (auth('sanctum')->check()) {
            $hasVoted = $sub->votes()->where('user_id', auth('sanctum')->id())->exists();
        }

        return [
            'id' => $sub->id,
            'title' => $sub->title,
            'category' => $sub->category,
            'description' => $sub->description,
            'author_name' => $sub->user->display_name ?? 'Unknown Developer',
            'user_id' => $sub->user_id,
            'media_url' => $sub->media_path ? asset('storage/' . $sub->media_path) : null,
            'total_votes' => $sub->votes()->count(),
            'comments_count' => $sub->comments()->count(),
            'reposts_count' => $sub->reposts()->count(),
            'has_voted' => $hasVoted,
            'created_at' => $sub->created_at->toFormattedDateString(),
        ];
    });

    return response()->json($formatted);
}
}