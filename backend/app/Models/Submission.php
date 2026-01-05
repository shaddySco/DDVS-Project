<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
class Submission extends Model
{
    protected $fillable = [
    'user_id',
    'title',
    'description',
    'repository_url',
    'ownership_status',

    'verification_message',
    'verification_signature',
    'verification_path',
    'verified_at',
];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function isVerified(): bool
{
    return !is_null($this->verified_at)
        && $this->ownership_status === 'verified';
}

public function disputes()
{
    return $this->hasMany(Dispute::class);
}
public function isDisputed(): bool
{
    return $this->ownership_status === 'disputed';
}

public function isInvalidated(): bool
{
    return $this->ownership_status === 'invalidated';
}
public function user()
{
    return $this->belongsTo(User::class);
}
}

