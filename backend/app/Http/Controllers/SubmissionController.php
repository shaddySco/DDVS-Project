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
            'media' => 'required|image|max:2048' // Changed to required for your masterpiece
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
    // Find project and include the author's details
    $submission = Submission::with('user')->find($id);

    if (!$submission) {
        return response()->json(['message' => 'Project not found'], 404);
    }

    // Format the response to match your frontend needs
    return response()->json([
        'id' => $submission->id,
        'title' => $submission->title,
        'category' => $submission->category,
        'description' => $submission->description,
        'repo_url' => $submission->repo_url ?? $submission->repository_url,
        'author_name' => $submission->user->username ?? $submission->user->name,
        'user_id' => $submission->user_id,
        'media_url' => $submission->media_path ? asset('storage/' . $submission->media_path) : null,
        'transaction_hash' => $submission->transaction_hash,
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

    // Format the data to match your frontend keys (sub.author_name, etc.)
    $formatted = $submissions->map(function($sub) {
        return [
            'id' => $sub->id,
            'title' => $sub->title,
            'category' => $sub->category,
            'description' => $sub->description,
            'author_name' => $sub->user->name ?? 'Unknown Developer',
            'user_id' => $sub->user_id,
            'total_votes' => $sub->votes_count ?? 0, // You can add counts later
            'comments_count' => $sub->comments_count ?? 0,
            'reposts_count' => $sub->reposts_count ?? 0,
            'has_voted' => false, // Check if current user voted
        ];
    });

    return response()->json($formatted);
}
}