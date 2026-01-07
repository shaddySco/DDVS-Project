<?php
// app/Http/Controllers/RepostController.php
namespace App\Http\Controllers;

use App\Models\Repost;
use App\Models\Submission;
use Illuminate\Http\Request;

class RepostController extends Controller
{
    public function store(Request $request, Submission $submission)
    {
        $user = $request->user();

        if ($submission->user_id === $user->id) {
            return response()->json([
                'message' => 'You cannot repost your own submission'
            ], 403);
        }

        $exists = Repost::where('user_id', $user->id)
            ->where('submission_id', $submission->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Already reposted'
            ], 409);
        }

        $repost = Repost::create([
            'user_id' => $user->id,
            'submission_id' => $submission->id,
        ]);

        return response()->json([
            'message' => 'Reposted successfully',
            'repost' => $repost
        ], 201);
    }
}
