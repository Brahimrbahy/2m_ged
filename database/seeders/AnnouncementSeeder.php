<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@test.com')->first();

        if (!$admin) {
            return;
        }

        $announcements = [
            [
                'title' => 'Welcome to 2M GED',
                'content' => '<p>Welcome to <strong>2M GED</strong> — your new document management platform!</p><p>Here you can:</p><ul><li>Upload and organize documents</li><li>Create collaborative spaces with your team</li><li>Share documents with granular permissions</li><li>Stay updated with real-time notifications</li></ul><p>Get started by uploading your first document or creating a space.</p>',
                'status' => 'published',
                'is_pinned' => true,
            ],
            [
                'title' => 'New Feature: Document Sharing',
                'content' => '<p>We\'re excited to announce <strong>granular document sharing</strong>!</p><p>You can now share documents with specific permission levels:</p><ul><li><strong>View Only</strong> — Read-only access</li><li><strong>Can Comment</strong> — View and add comments</li><li><strong>Can Edit</strong> — Edit document details</li><li><strong>Can Delete</strong> — Full control including deletion</li></ul><p>Set expiration dates for temporary access. Try it from any document\'s Share button.</p>',
                'status' => 'published',
                'is_pinned' => false,
            ],
            [
                'title' => 'Tips for Organizing Documents',
                'content' => '<p>Keep your documents organized with these best practices:</p><ol><li><strong>Use descriptive titles</strong> — Make documents easy to find via search</li><li><strong>Create dedicated spaces</strong> — Group related documents by team or project</li><li><strong>Add descriptions</strong> — Help others understand document context</li><li><strong>Use versioning</strong> — Track document changes over time</li></ol><p>Need help? Check the sidebar links for quick navigation.</p>',
                'status' => 'published',
                'is_pinned' => false,
            ],
        ];

        foreach ($announcements as $i => $data) {
            Announcement::create(array_merge($data, [
                'created_by' => $admin->id,
                'created_at' => now()->subDays(count($announcements) - $i),
                'updated_at' => now()->subDays(count($announcements) - $i),
            ]));
        }
    }
}
