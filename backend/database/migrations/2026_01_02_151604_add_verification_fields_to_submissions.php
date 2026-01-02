<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->text('verification_message')->nullable()->after('repository_url');
            $table->text('verification_signature')->nullable();
            $table->string('verification_path')->nullable();
            $table->timestamp('verified_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn([
                'verification_message',
                'verification_signature',
                'verification_path',
                'verified_at',
            ]);
        });
    }
};
