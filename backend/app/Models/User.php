<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;   // ✅ CORRECT
use App\Models\Submission;
use App\Models\Vote;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;   // ✅ CORRECT

    protected $fillable = [
        'wallet_address',
        'username',
        'xp',
    ];

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'voter_id');
    }

    public function getLevelAttribute(): int
    {
        return intdiv($this->xp, 100) + 1;
    }

    public function canResolveDisputes(): bool
{
    $level = floor($this->xp / 100) + 1;
    return $level >= 5;
}
public function comments() {
    return $this->hasMany(Comment::class);
}

public function followers() {
    return $this->belongsToMany(
        User::class,
        'followers',
        'followed_id',
        'follower_id'
    );
}

// In User.php

public function following()
{
    // follower_id = the person doing the following (you)
    // user_id = the person being followed
    return $this->belongsToMany(User::class, 'followers', 'follower_id', 'user_id');
}
public function reposts() {
    return $this->hasMany(Repost::class);
}


}
