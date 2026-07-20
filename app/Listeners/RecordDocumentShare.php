<?php

namespace App\Listeners;

use App\Models\Activity;
use App\Models\DocumentShare;
use Illuminate\Queue\InteractsWithQueue;

class RecordDocumentShare
{
    public function handle(DocumentShare $share): void
    {
        $document = $share->document()->with('uploader')->first();

        if (!$document) {
            return;
        }

        Activity::log(
            $document->uploader,
            'document_shared',
            "Shared \"{$document->title}\" with {$share->sharedWithUser->name}",
            $document,
        );
    }
}
