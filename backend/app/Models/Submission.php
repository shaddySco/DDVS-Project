<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Submission extends Model
{
    protected $fillable = [
        'user_id', 'title', 'category', 'description', 
        'repository_url', 'media_path', 'transaction_hash',
        'verification_message', 'verification_signature', 'verification_path',
        'verified_at', 'ownership_status', 'attestation_hash'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    /* =======================
     | Relationships
     ======================= */

  public function user()
{
    // Ensure this relationship is defined!
    return $this->belongsTo(User::class, 'user_id');
}
  public function votes()
{
    // Specify 'submission_id' if you used a non-standard name, 
    // but here the standard is fine.
    return $this->hasMany(Vote::class, 'submission_id');
}

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Repost::class);
    }

    /* =======================
     | State Helpers
     ======================= */

    public function isVerified(): bool
    {
        return $this->ownership_status === 'verified'
            && !is_null($this->ver_);
    }
    }