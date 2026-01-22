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
    protected $appends = ['level', 'followers_count', 'following_count'];

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
   /**
 * SOCIAL / FOLLOW SYSTEM
 */

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