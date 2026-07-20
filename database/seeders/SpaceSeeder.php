<?php

namespace Database\Seeders;

use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Seeder;

class SpaceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@test.com')->first();
        $manager = User::where('email', 'manager@test.com')->first();
        $regularUsers = User::where('role', 'user')->get();

        $spaces = [
            [
                'name' => 'Engineering Documentation',
                'description' => 'Technical specifications, API docs, and architecture diagrams for the engineering team.',
                'is_public' => false,
                'created_by' => $admin->id,
                'members' => [
                    ['user_id' => $admin->id, 'role' => 'admin'],
                    ['user_id' => $manager->id, 'role' => 'admin'],
                    ['user_id' => $regularUsers[0]->id, 'role' => 'contributor'],
                ],
            ],
            [
                'name' => 'Marketing Campaigns',
                'description' => 'Brand guidelines, campaign assets, and marketing strategy documents.',
                'is_public' => false,
                'created_by' => $manager->id,
                'members' => [
                    ['user_id' => $manager->id, 'role' => 'admin'],
                    ['user_id' => $regularUsers[1]->id, 'role' => 'contributor'],
                    ['user_id' => $regularUsers[2]->id, 'role' => 'viewer'],
                ],
            ],
            [
                'name' => 'HR Policies',
                'description' => 'Company policies, onboarding materials, and HR procedures.',
                'is_public' => true,
                'created_by' => $admin->id,
                'members' => [
                    ['user_id' => $admin->id, 'role' => 'admin'],
                    ['user_id' => $manager->id, 'role' => 'viewer'],
                ],
            ],
            [
                'name' => 'Project Alpha',
                'description' => 'Confidential project documents for the upcoming product launch.',
                'is_public' => false,
                'created_by' => $manager->id,
                'members' => [
                    ['user_id' => $manager->id, 'role' => 'admin'],
                    ['user_id' => $regularUsers[0]->id, 'role' => 'contributor'],
                    ['user_id' => $regularUsers[2]->id, 'role' => 'contributor'],
                ],
            ],
            [
                'name' => 'Company Wiki',
                'description' => 'Public knowledge base and shared documentation for all employees.',
                'is_public' => true,
                'created_by' => $admin->id,
                'members' => [
                    ['user_id' => $admin->id, 'role' => 'admin'],
                ],
            ],
        ];

        foreach ($spaces as $spaceData) {
            $members = $spaceData['members'];
            unset($spaceData['members']);

            $space = Space::create($spaceData);

            foreach ($members as $member) {
                $space->members()->attach($member['user_id'], [
                    'role' => $member['role'],
                    'joined_at' => now(),
                ]);
            }
        }
    }
}
