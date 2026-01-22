<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{
    // app/Http/Controllers/VoteController.php

public function store(Request $request)
{
    $request->validate(['submission_id' => 'required|exists:submissions,id']);

    $voterId = auth()->id();
    $submissionId = $request->submission_id;

    // 1. Prevent double voting (Check if THIS user already voted on THIS project)
    $alreadyVoted = Vote::where('submission_id', $submissionId)
                        ->where('voter_id', $voterId)
                        ->exists();

    if ($alreadyVoted) {
        return response()->json(['message' => 'Already voted'], 409);
    }

    // 2. Record the vote
    Vote::create([
        'submission_id' => $submissionId,
        'voter_id' => $voterId
    ]);

    // 3. Award XP to the Author
    $submission = Submission::find($submissionId);
    $author = $submission->user; // 👈 This MUST be the owner of the project

    if ($author) {
        // We remove the "if voter is not author" check so you can vote for yourself
        $author->increment('xp', 10); 
        
        // Update level logic
        $author->level = floor($author->xp / 100) + 1;
        $author->save();
        
        // Log it to your terminal to prove it worked
        \Log::info("XP Awarded: User {$author->id} now has {$author->xp} XP");
    }

    return response()->json([
        'message' => 'Vote recorded!',
        'total_votes' => Vote::where('submission_id', $submissionId)->count()
    ]);
}
}