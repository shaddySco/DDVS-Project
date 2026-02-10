<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add category-based XP tracking to users
        Schema::table('users', function (Blueprint $table) {
            $table->json('category_xp')->nullable()->default(json_encode([]))->after('xp');
            $table->json('skills_verified')->nullable()->default(json_encode([]))->after('category_xp');
        });

        // Create skill_reputation table for detailed tracking
        Schema::create('skill_reputation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category')->index(); // 'web-dev', 'blockchain', 'mobile', etc.
            $table->integer('xp')->default(0);
            $table->integer('level')->default(1);
            $table->integer('submission_count')->default(0);
            $table->integer('vote_count')->default(0);
            $table->timestamp('last_contribution_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['category_xp', 'skills_verified']);
        });
        Schema::dropIfExists('skill_reputation');
    }
};
