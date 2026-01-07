<?php
// app/Models/Repost.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Repost extends Model
{
    protected $fillable = ['user_id', 'submission_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }
}
