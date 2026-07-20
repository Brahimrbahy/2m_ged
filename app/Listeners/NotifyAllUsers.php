<?php

namespace App\Listeners;

use App\Events\DocumentUploaded;
use App\Models\Document;
use App\Models\Notification;
use App\Models\User;

class NotifyAllUsers
{
    public function handle(DocumentUploaded $event): void
    {
        $document = $event->document->load('uploader');

        $uploader = $document->uploader;

        User::where('id', '!=', $event->uploadedBy)
            ->where('status', 'active')
            ->each(function (User $user) use ($document, $uploader) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'document_uploaded',
                    'title' => 'New document uploaded',
                    'message' => "{$uploader->name} uploaded \"{$document->title}\".",
                    'notifiable_type' => Document::class,
                    'notifiable_id' => $document->id,
                    'action_url' => "/documents/{$document->id}",
                ]);
            });
    }
}
