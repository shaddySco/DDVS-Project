<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillReputation extends Model
{
    protected $table = 'skill_reputation';

    protected $fillable = [
        'user_id',
        'category',
        'xp',
        'level',
        'submission_count',
        'vote_count',
        'last_contribution_at',
    ];

    protected $casts = [
        'last_contribution_at' => 'datetime',
    ];

    /* =======================
     | Relationships
     ======================= */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* =======================
     | Helpers
     ======================= */

    /**
     * Get skill level based on XP (every 100 XP = 1 level)
     */
    public function calculateLevel(): int
    {
        return intdiv($this->xp, 100) + 1;
    }

    /**
     * Award XP to this skill
     */
    public function awardXp(int $amount): void
    {
        $this->xp += $amount;
        $this->level = $this->calculateLevel();
        $this->last_contribution_at = now();
        $this->save();
    }

    /**
     * Deduct XP from this skill
     */
    public function deductXp(int $amount): void
    {
        $this->xp = max(0, $this->xp - $amount);
        $this->level = $this->calculateLevel();
        $this->save();
    }

    /**
     * Check if user achieved mastery in this skill (Level 5+)
     */
    public function isMastered(): bool
    {
        return $this->level >= 5;
    }
}
