<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\User;
use Illuminate\Database\Seeder;

class DocumentVersionSeeder extends Seeder
{
    public function run(): void
    {
        $documents = Document::with('uploader')->get();

        foreach ($documents as $doc) {
            $maxVersion = $doc->version;

            for ($v = 1; $v <= $maxVersion; $v++) {
                DocumentVersion::create([
                    'document_id' => $doc->id,
                    'version_number' => $v,
                    'file_path' => $doc->file_path,
                    'file_size' => $doc->file_size - (($maxVersion - $v) * 1024),
                    'created_by' => $doc->uploaded_by,
                    'description' => $v === 1 ? 'Initial upload' : "Update v{$v}",
                    'created_at' => $doc->created_at->copy()->addDays($v - 1),
                ]);
            }
        }
    }
}
