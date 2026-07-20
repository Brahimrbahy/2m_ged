<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        $notifications = [
            [
                'type' => 'document_uploaded',
                'title' => 'New document uploaded',
                'message' => 'Admin User uploaded "Q4 Financial Report" to Finance Team.',
                'action_url' => '/documents/1',
            ],
            [
                'type' => 'document_uploaded',
                'title' => 'New document uploaded',
                'message' => 'Manager User uploaded "Product Roadmap 2026" to Engineering.',
                'action_url' => '/documents/2',
            ],
            [
                'type' => 'member_added',
                'title' => 'New team member',
                'message' => 'Admin User added you to the Marketing space.',
                'action_url' => '/spaces/3',
            ],
            [
                'type' => 'document_updated',
                'title' => 'Document updated',
                'message' => 'Manager User updated "API Documentation" in Engineering.',
                'action_url' => '/documents/4',
            ],
            [
                'type' => 'document_uploaded',
                'title' => 'New document uploaded',
                'message' => 'Admin User uploaded "Meeting Notes - July" to All Hands.',
                'action_url' => '/documents/5',
            ],
        ];

        foreach ($users as $user) {
            foreach ($notifications as $i => $notification) {
                Notification::create(array_merge($notification, [
                    'user_id' => $user->id,
                    'is_read' => $i > 2,
                    'read_at' => $i > 2 ? now()->subMinutes(30) : null,
                    'created_at' => now()->subHours(count($notifications) - $i),
                    'updated_at' => now()->subHours(count($notifications) - $i),
                ]));
            }
        }
    }
}
