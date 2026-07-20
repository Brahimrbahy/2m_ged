<?php

namespace App\Listeners;

use App\Events\DocumentUploaded;
use App\Models\Activity;

class RecordDocumentUpload
{
    public function handle(DocumentUploaded $event): void
    {
        $document = $event->document->load('uploader');

        Activity::log(
            $document->uploader,
            'document_uploaded',
            "Uploaded \"{$document->title}\"",
            $document,
        );
    }
}
