<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Submission;
use App\Models\News;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DDVSSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the DDVS Admin User
        // 1. Create the DDVS Admin User
        $admin = User::firstOrCreate(
            ['wallet_address' => '0xDDVS1234567890ABCDEF1234567890ABCDEF12'], // Fixed wallet address
            [
                'username' => 'DDVS System',
                'role' => 'admin',
                'xp' => 100,
                // 'level', 'subject_xp', 'focus_sector' are computed or not in DB
                'bio' => 'The official Decentralized Developer Verification System protocol administrator. Dispensing consensus updates and network news.',
                'developer_type' => 'Protocol Overseer',
            ]
        );

        // 2. Ensure only ONE project exists for this user: The System Itself
        // Remove any existing submissions for this user to ensure purity
        Submission::where('user_id', $admin->id)->delete();

        Submission::create([
            'user_id' => $admin->id,
            'title' => 'DDVS Protocol v1.0',
            'description' => 'The core decentralized verification system itself. A self-sovereign reputation layer for developers, powered by community consensus and immutable skill attestation.',
            'category' => 'Blockchain / Web3',
            'media_path' => 'images/landing_screenshot.png',
            'repository_url' => 'https://github.com/ddvs/protocol',
            'ownership_status' => 'verified',
            'verified_at' => now(),
            'attestation_hash' => '0x' . Str::random(64),
            // 'admin_verified', 'total_votes', 'smart_contract_address' removed
        ]);

        // 3. Seed Sample News
        News::updateOrCreate(
            ['title' => 'DDVS Protocol v1.0 Launch'],
            [
                'content' => 'We are excited to announce the official launch of the Decentralized Developer Verification System. Join the community and start verifying your skills today!',
                'author_id' => $admin->id,
                'is_published' => true,
                'image_url' => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
            ]
        );
        
        $this->command->info('DDVS Admin and System Project seeded successfully.');
    }
}
