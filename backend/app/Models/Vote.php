<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vote extends Model
{
    protected $fillable = [
        'submission_id',
        'voter_id',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function voters()
{
    return $this->belongsToMany(
        User::class,
        'votes',
        'submission_id',
        'voter_id'
    );
}

    public function votes()
{
    return $this->hasMany(Vote::class);
}

}
