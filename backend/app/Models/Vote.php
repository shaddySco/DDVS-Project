<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    // Use voter_id to match your migration
    protected $fillable = ['submission_id', 'voter_id'];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }
}