<?php
// app/Http/Controllers/ProfileController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Submission;
use App\Models\Repost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function feed(Request $request, string $wallet)
    {
        $profileUser = User::where('wallet_address', $wallet)->firstOrFail();

        // Original submissions by user
       $submissions = Submission::query()
    ->where('submissions.user_id', $profileUser->id)
    ->withCount('comments')
    ->select([
        'submissions.id',
        'submissions.user_id',
        'submissions.title',
        'submissions.description',
        'submissions.created_at',
        'comments_count',
        DB::raw('false as is_repost'),
        DB::raw('null as reposted_by'),
        DB::raw('null as reposted_at'),
            ]);

        // Reposts made by user
     $reposts = Repost::query()
    ->join('submissions', 'reposts.submission_id', '=', 'submissions.id')
    ->select([
        'submissions.id',
        'submissions.user_id',
        'submissions.title',
        'submissions.description',
        'reposts.created_at',
        DB::raw('true as is_repost'),
        'reposts.user_id as reposted_by',
        'reposts.created_at as reposted_at',
        DB::raw('(
            SELECT COUNT(*)
            FROM comments
            WHERE comments.submission_id = submissions.id
        ) as comments_count'),
    ]);

        $feed = $submissions
            ->unionAll($reposts)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'user' => [
                'id' => $profileUser->id,
                'wallet_address' => $profileUser->wallet_address,
            ],
            'feed' => $feed
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'username' => 'nullable|string|max:255',
            'github_username' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|string|max:1000',
            'developer_type' => 'nullable|string|max:255',
        ]);

        $user->update([
            'username' => $request->username,
            'github_username' => $request->github_username,
            'bio' => $request->bio,
            'skills' => $request->skills,
            'developer_type' => $request->developer_type,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
