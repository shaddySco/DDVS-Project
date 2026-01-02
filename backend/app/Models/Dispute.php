<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    protected $fillable = [
        'submission_id',
        'raised_by',
        'reason',
        'status',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'raised_by');
    }
}
