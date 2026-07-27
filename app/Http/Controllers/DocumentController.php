<?php

namespace App\Http\Controllers;

use App\Events\DocumentUploaded;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Activity;
use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\DocumentVersion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $documents = Document::with('uploader', 'space')
            ->withCount('versions')
            ->where('uploaded_by', $user->id)
            ->latest()
            ->paginate(12)
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

        if ($request->has('search')) {
            $documents = Document::with('uploader', 'space')
                ->withCount('versions')
                ->where('uploaded_by', $user->id)
                ->where('title', 'like', '%'.$request->input('search').'%')
                ->latest()
                ->paginate(12)
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
        }

        return Inertia::render('documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $fileName = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $filePath = $file->storeAs('documents', $fileName, 'local');

        $document = Document::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'file_path' => $filePath,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
            'space_id' => $request->input('space_id'),
            'status' => 'draft',
            'version' => 1,
        ]);

        DocumentUploaded::dispatch($document, Auth::id());

        $document->createVersion(Auth::user(), 'Initial upload');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Document uploaded successfully.']);

        return to_route('documents.index');
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        Gate::authorize('update', $document);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $document->update(['title' => $validated['title']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Document renamed successfully.']);

        return back();
    }

    public function show(Document $document): Response
    {
        Gate::authorize('view', $document);

        $document->load('uploader', 'space', 'shares.sharedWithUser');

        $latestVersions = $document->versions()
            ->with('creator:id,name')
            ->orderByDesc('version_number')
            ->limit(5)
            ->get()
            ->map(fn (DocumentVersion $v) => [
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

        $versionsCount = $document->versions()->count();

        return Inertia::render('documents/Show', [
            'document' => [
                'id' => $document->id,
                'title' => $document->title,
                'description' => $document->description,
                'file_path' => $document->file_path,
                'file_type' => $document->file_type,
                'file_size' => $document->file_size,
                'formatted_size' => $document->formatted_size,
                'status' => $document->status,
                'version' => $document->version,
                'icon' => $document->getFileIcon(),
                'uploaded_by' => $document->uploaded_by,
                'created_at' => $document->created_at->toIso8601String(),
                'updated_at' => $document->updated_at->toIso8601String(),
                'can_edit' => $document->canEdit(Auth::user()),
                'can_delete' => $document->canDelete(Auth::user()),
                'can_share' => Gate::allows('share', $document),
                'versions_count' => $versionsCount,
                'latest_versions' => $latestVersions,
                'shares' => $document->shares->map(fn ($share) => [
                    'id' => $share->id,
                    'permission_level' => $share->permission_level,
                    'permission_label' => DocumentShare::PERMISSIONS[$share->permission_level],
                    'expires_at' => $share->expires_at?->toIso8601String(),
                    'has_expired' => $share->hasExpired(),
                    'user' => [
                        'id' => $share->sharedWithUser->id,
                        'name' => $share->sharedWithUser->name,
                        'email' => $share->sharedWithUser->email,
                    ],
                ]),
                'uploader' => [
                    'id' => $document->uploader->id,
                    'name' => $document->uploader->name,
                ],
                'space' => $document->space ? [
                    'id' => $document->space->id,
                    'name' => $document->space->name,
                ] : null,
            ],
        ]);
    }

    public function preview(Document $document): HttpResponse
    {
        Gate::authorize('view', $document);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404);
        }

        $mimeTypes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'webp' => 'image/webp',
            'txt' => 'text/plain',
            'html' => 'text/html',
            'htm' => 'text/html',
        ];

        $mimeType = $mimeTypes[$document->file_type] ?? Storage::mimeType($document->file_path);

        $file = Storage::disk('local')->get($document->file_path);

        return response($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="'.$document->title.'.'.$document->file_type.'"',
            'Cache-Control' => 'no-cache',
        ]);
    }

    public function destroy(Document $document): RedirectResponse
    {
        Gate::authorize('delete', $document);

        if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        Activity::log(
            Auth::user(),
            'document_deleted',
            "Deleted \"{$document->title}\"",
        );

        $document->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Document deleted successfully.']);

        return to_route('documents.index');
    }
}
