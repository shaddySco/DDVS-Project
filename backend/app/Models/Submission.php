<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $fillable = [
    'wallet_address',
    'github_link',
    'description',
    'tx_hash',
    'votes'
];

}
