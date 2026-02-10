<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that a user can create a submission
     */
    public function test_user_can_create_submission()
    {
        // Create and authenticate a user
        $user = User::factory()->create();

        // Prepare submission data
        $submissionData = [
            'title' => 'Neural Network Optimizer',
            'category' => 'Machine Learning',
            'description' => 'This is a comprehensive machine learning project that implements advanced neural network optimization techniques.',
            'repository_url' => 'https://github.com/user/neural-optimizer',
        ];

        // Send request as authenticated user
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/projects', $submissionData);

        // Should return 201 Created
        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'id',
                     'project' => [
                         'id',
                         'user_id',
                         'title',
                         'category',
                         'description',
                         'repository_url',
                     ]
                 ]);

        // Verify submission was created in database
        $this->assertDatabaseHas('submissions', [
            'user_id' => $user->id,
            'title' => 'Neural Network Optimizer',
            'category' => 'Machine Learning',
        ]);
    }

    /**
     * Test that user submissions can be retrieved
     */
    public function test_user_can_retrieve_own_submissions()
    {
        // Create user and submissions
        $user = User::factory()->create();
        Submission::factory()->count(3)->create(['user_id' => $user->id]);

        // Fetch user's submissions
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/submissions/mine');

        $response->assertStatus(200)
                 ->assertJsonIsArray()
                 ->assertCount(3);
    }

    /**
     * Test validation errors for missing fields
     */
    public function test_submission_validates_required_fields()
    {
        $user = User::factory()->create();

        // Missing required fields
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/projects', [
                'title' => 'Test', // Missing category, description, repository_url
            ]);

        // Should return 422 Unprocessable Entity
        $response->assertStatus(422)
                 ->assertJsonStructure(['errors']);
    }

    /**
     * Test that submissions require authentication
     */
    public function test_submission_requires_authentication()
    {
        $submissionData = [
            'title' => 'Test Project',
            'category' => 'Web Development',
            'description' => 'A test web development project.',
            'repository_url' => 'https://github.com/user/test',
        ];

        $response = $this->postJson('/api/projects', $submissionData);

        // Should return 401 Unauthorized
        $response->assertStatus(401);
    }

    /**
     * Test that submission can be verified with transaction hash
     */
    public function test_submission_can_be_verified()
    {
        $user = User::factory()->create();
        $submission = Submission::factory()->create([
            'user_id' => $user->id,
            'ownership_status' => 'pending'
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/projects/{$submission->id}/verify", [
                'tx_hash' => '0x1234567890abcdef'
            ]);

        $response->assertStatus(200);

        // Verify the submission was updated
        $this->assertDatabaseHas('submissions', [
            'id' => $submission->id,
            'transaction_hash' => '0x1234567890abcdef',
            'ownership_status' => 'verified'
        ]);
    }

    /**
     * Test that community feed only shows verified submissions
     */
    public function test_community_feed_shows_only_verified_submissions()
    {
        // Create verified and unverified submissions
        Submission::factory()->create(['ownership_status' => 'verified']);
        Submission::factory()->create(['ownership_status' => 'verified']);
        Submission::factory()->create(['ownership_status' => 'pending']);

        $response = $this->getJson('/api/submissions');

        // Should return verified submissions only
        $response->assertStatus(200)
                 ->assertJsonIsArray()
                 ->assertCount(2);

        // Check that all returned submissions are verified
        $submissions = $response->json();
        foreach ($submissions as $submission) {
            $this->assertEquals('verified', $submission['ownership_status']);
        }
    }
}
