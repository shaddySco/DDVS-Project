<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Only add 'xp' if it doesn't exist
        if (!Schema::hasColumn('users', 'xp')) {
            $table->integer('xp')->default(0);
        }
        
        // Only add 'level' if it doesn't exist
        if (!Schema::hasColumn('users', 'level')) {
            $table->integer('level')->default(1);
        }
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['xp', 'level']);
    });
}
};
