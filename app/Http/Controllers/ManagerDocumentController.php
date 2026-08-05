<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ManagerDocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Document::with('uploader', 'space')
            ->withCount('versions')
            ->forUser($user);

        if ($search = $request->input('search')) {
            $query->searchable($search);
        }

        if ($fileType = $request->input('file_type')) {
            $query->byFileType($fileType);
        }

        if ($dateRange = $request->input('date_range')) {
            $query->dateRange($dateRange);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDir = $request->input('dir', 'desc');
        $allowedSorts = ['title', 'created_at', 'file_size', 'status', 'updated_at'];

        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $documents = $query->paginate(15)
            ->through(fn (Document $doc) => [
                'id' => $doc->id,
                'title' => $doc->title,
                'description' => $doc->description,
                'file_type' => $doc->file_type,
                'file_size' => $doc->file_size,
                'formatted_size' => $doc->formatted_size,
                'status' => $doc->status,
                'version' => $doc->version,
                'icon' => $doc->getFileIcon(),
                'created_at' => $doc->created_at->toIso8601String(),
                'updated_at' => $doc->updated_at->toIso8601String(),
                'can_edit' => $doc->canEdit($user),
                'can_delete' => $doc->canDelete($user),
                'can_share' => Gate::forUser($user)->allows('share', $doc),
                'shares_count' => $doc->shares()->count(),
                'versions_count' => $doc->versions_count,
                'uploader' => [
                    'id' => $doc->uploader->id,
                    'name' => $doc->uploader->name,
                ],
                'space' => $doc->space ? [
                    'id' => $doc->space->id,
                    'name' => $doc->space->name,
                ] : null,
            ]);

        return Inertia::render('manager/Documents', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'file_type', 'date_range', 'status', 'sort', 'dir']),
        ]);
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        $user = Auth::user();

        if (empty($ids)) {
            return back();
        }

        $documents = Document::whereIn('id', $ids)->get();
        $deleted = 0;

        foreach ($documents as $document) {
            if ($document->canDelete($user)) {
                if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
                    Storage::disk('local')->delete($document->file_path);
                }
                $document->delete();
                $deleted++;
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$deleted} document(s) deleted successfully.",
        ]);

        return back();
    }

    public function bulkDownload(Request $request): RedirectResponse|BinaryFileResponse
    {
        $ids = $request->input('ids', []);
        $user = Auth::user();

        if (empty($ids)) {
            return back();
        }

        $documents = Document::whereIn('id', $ids)->get()->filter(fn ($d) => $d->canAccess($user));

        if ($documents->isEmpty()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No accessible documents selected.']);
            return back();
        }

        $zipName = 'documents-' . now()->format('Y-m-d-His') . '.zip';
        $zipPath = storage_path("app/temp/{$zipName}");

        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE) !== true) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Could not create zip archive.']);
            return back();
        }

        foreach ($documents as $document) {
            if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
                $ext = pathinfo($document->file_path, PATHINFO_EXTENSION);
                $zip->addFile(
                    Storage::disk('local')->path($document->file_path),
                    "{$document->title}.{$ext}"
                );
            }
        }

        $zip->close();

        return response()->download($zipPath, $zipName)->deleteFileAfterSend();
    }
}
