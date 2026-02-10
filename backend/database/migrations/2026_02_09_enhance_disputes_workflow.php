<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add more sophisticated dispute tracking
        Schema::table('disputes', function (Blueprint $table) {
            // Add new columns for sophisticated dispute workflow
            $table->foreignId('arbitrator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('decision')->nullable()->comment('invalidate, reject, appeal');
            $table->text('arbitrator_notes')->nullable();
            $table->enum('status', ['pending', 'under_review', 'resolved', 'appealed', 'closed'])->default('pending')->change();
            $table->integer('upvotes')->default(0)->comment('Community support for dispute');
            $table->integer('downvotes')->default(0)->comment('Community opposition to dispute');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('appealed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->dropForeign(['arbitrator_id']);
            $table->dropColumn([
                'arbitrator_id',
                'decision',
                'arbitrator_notes',
                'upvotes',
                'downvotes',
                'resolved_at',
                'appealed_at'
            ]);
        });
    }
};
