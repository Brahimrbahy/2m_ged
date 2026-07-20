<?php

namespace App\Listeners;

use App\Events\DocumentUploaded;
use App\Models\Notification;
use App\Models\User;

class NotifySpaceMembers
{
    public function handle(DocumentUploaded $event): void
    {
        $document = $event->document->load('space.members', 'uploader');

        if (!$document->space) {
            return;
        }

        $uploader = $document->uploader;

        $document->space->members
            ->filter(fn (User $member) => $member->id !== $event->uploadedBy)
            ->each(function (User $member) use ($document, $uploader) {
                Notification::create([
                    'user_id' => $member->id,
                    'type' => 'document_uploaded',
                    'title' => 'New document uploaded',
                    'message' => "{$uploader->name} uploaded \"{$document->title}\" to {$document->space->name}.",
                    'notifiable_type' => Document::class,
                    'notifiable_id' => $document->id,
                    'action_url' => "/documents/{$document->id}",
                ]);
            });
    }
}
