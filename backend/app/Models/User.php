<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    // This ensures 'level' is included when the user is sent to React
    protected $appends = ['level', 'followers_count', 'following_count', 'display_name', 'focus_sector'];

   protected $fillable = [
    'name',
    'email',
    'password',
    'wallet_address',
    'username',
    'bio',
    'skills',
    'developer_type',
    'xp',      // Ensure this is here
    'level',   // Ensure this is here
];

    /**
     * ATTRIBUTES
     */

    // Calculate level based on XP (100 XP per level)
    public function getLevelAttribute(): int
    {
        return intdiv($this->xp, 100) + 1;
    }

    // Logic for Dispute resolution (Level 5 requirement)
    public function canResolveDisputes(): bool
    {
        return $this->level >= 5;
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->username) return $this->username;
        if ($this->name) return $this->name;
        
        // Fallback to wallet address slice: 0x1234...5678
        $addr = $this->wallet_address;
        if (strlen($addr) > 10) {
            return substr($addr, 0, 6) . '...' . substr($addr, -4);
        }
        return $addr ?? 'Anonymous';
    }

    public function getFocusSectorAttribute(): string
    {
        $lastSubmissions = $this->submissions()
            ->latest()
            ->take(3)
            ->pluck('category');

        if ($lastSubmissions->isEmpty()) return 'Unknown';

        $counts = $lastSubmissions->countBy();
        return $counts->sortDesc()->keys()->first();
    }

    public function getSubjectXp(string $category): int
    {
        return $this->submissions()
            ->where('category', $category)
            ->withCount('votes')
            ->get()
            ->sum('votes_count');
    }

    /**
     * RELATIONSHIPS
     */

    // Submissions authored by this user
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'user_id');
    }

    // Votes cast by this user
    public function votes(): HasMany
    {
        // Matches the 'user_id' column we fixed in your migrations
        return $this->hasMany(Vote::class, 'user_id');
    }

    public function comments(): HasMany 
    {
        return $this->hasMany(Comment::class);
    }

    public function reposts(): HasMany 
    {
        return $this->hasMany(Repost::class);
    }

    /**
     * SOCIAL / FOLLOW SYSTEM
     */

    // Users who follow this user
    // Users who follow this user
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class, 
            'followers', 
            'followed_id',   // Column representing the person being followed
            'follower_id'    // Column representing the person doing the following
        );
    }

// Users this user is following
public function following(): BelongsToMany
{
    return $this->belongsToMany(
        User::class, 
        'followers', 
        'follower_id',   // Column representing the person doing the following
        'followed_id'    // Column representing the person being followed
    );
}

    public function getFollowersCountAttribute(): int
{
    return $this->followers()->count();
}

public function getFollowingCountAttribute(): int
{
    return $this->following()->count();
}
}