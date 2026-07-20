<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentVersionController extends Controller
{
    public function index(Document $document): Response
    {
        $versions = $document->versions()
            ->with('creator:id,name')
            ->orderByDesc('version_number')
            ->paginate(20)
            ->through(fn (DocumentVersion $v) => [
                'id' => $v->id,
                'version_number' => $v->version_number,
                'file_size' => $v->file_size,
                'formatted_size' => $v->formatted_size,
                'description' => $v->description,
                'created_at' => $v->created_at->toIso8601String(),
                'creator' => [
                    'id' => $v->creator->id,
                    'name' => $v->creator->name,
                ],
            ]);

        return Inertia::render('documents/Versions', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'version' => $document->version,
                'file_type' => $document->file_type,
                'icon' => $document->getFileIcon(),
            ],
            'versions' => $versions,
        ]);
    }

    public function show(Document $document, DocumentVersion $version): Response
    {
        if ($version->document_id !== $document->id) {
            abort(404);
        }

        $version->load('creator:id,name');

        return Inertia::render('documents/VersionDetail', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'version' => $document->version,
                'file_type' => $document->file_type,
                'icon' => $document->getFileIcon(),
            ],
            'version' => [
                'id' => $version->id,
                'version_number' => $version->version_number,
                'file_size' => $version->file_size,
                'formatted_size' => $version->formatted_size,
                'description' => $version->description,
                'created_at' => $version->created_at->toIso8601String(),
                'creator' => [
                    'id' => $version->creator->id,
                    'name' => $version->creator->name,
                ],
            ],
        ]);
    }

    public function download(Document $document, DocumentVersion $version)
    {
        if ($version->document_id !== $document->id) {
            abort(404);
        }

        if (!Storage::disk('local')->exists($version->file_path)) {
            abort(404);
        }

        $extension = pathinfo($version->file_path, PATHINFO_EXTENSION);
        $downloadName = "{$document->title}_v{$version->version_number}.{$extension}";

        return Storage::disk('local')->download($version->file_path, $downloadName);
    }

    public function restore(Document $document, DocumentVersion $version): RedirectResponse
    {
        if ($version->document_id !== $document->id) {
            abort(404);
        }

        if (!Storage::disk('local')->exists($version->file_path)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Version file not found on disk.']);
            return back();
        }

        $user = Auth::user();
        $newVersionNumber = $document->version + 1;

        $restoredPath = $version->file_path;

        $document->update([
            'file_path' => $restoredPath,
            'file_size' => $version->file_size,
            'version' => $newVersionNumber,
        ]);

        $document->versions()->create([
            'version_number' => $newVersionNumber,
            'file_path' => $restoredPath,
            'file_size' => $version->file_size,
            'created_by' => $user->id,
            'description' => "Restored from v{$version->version_number}",
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Document restored to v{$version->version_number}. Now at v{$newVersionNumber}.",
        ]);

        return to_route('documents.versions.index', $document);
    }
}
