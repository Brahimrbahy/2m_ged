<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSpaceRequest;
use App\Models\Activity;
use App\Models\Document;
use App\Models\Space;
use App\Models\User;
use App\Events\DocumentUploaded;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SpaceController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $spaces = Space::byUser($user)
            ->withCount('documents', 'members')
            ->with('creator')
            ->latest()
            ->get()
            ->map(fn (Space $space) => [
                'id' => $space->id,
                'name' => $space->name,
                'slug' => $space->slug,
                'description' => $space->description,
                'is_public' => $space->is_public,
                'document_count' => $space->documents_count,
                'member_count' => $space->members_count,
                'user_role' => $space->userRole($user),
                'created_at' => $space->created_at->toIso8601String(),
                'creator' => [
                    'id' => $space->creator->id,
                    'name' => $space->creator->name,
                ],
            ]);

        return Inertia::render('spaces/Index', [
            'spaces' => $spaces,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('spaces/Create');
    }

    public function store(StoreSpaceRequest $request): RedirectResponse
    {
        $space = Space::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'is_public' => $request->boolean('is_public'),
            'created_by' => Auth::id(),
        ]);

        $space->members()->attach(Auth::id(), [
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Space created successfully.']);

        return to_route('spaces.show', $space);
    }

    public function show(Space $space): Response
    {
        $user = Auth::user();
        $role = $space->userRole($user);

        if (!$role && !$space->is_public) {
            abort(403);
        }

        $space->load(['creator', 'documents.uploader', 'members']);
        $space->loadCount('documents');

        $allUsers = User::where('id', '!=', Auth::id())
            ->where('status', 'active')
            ->select('id', 'name', 'email')
            ->get();

        $existingMemberIds = $space->members->pluck('id')->toArray();
        $availableUsers = $allUsers->filter(fn (User $u) => !in_array($u->id, $existingMemberIds))->values();

        return Inertia::render('spaces/Show', [
            'space' => [
                'id' => $space->id,
                'name' => $space->name,
                'slug' => $space->slug,
                'description' => $space->description,
                'is_public' => $space->is_public,
                'document_count' => $space->documents_count,
                'user_role' => $role,
                'created_at' => $space->created_at->toIso8601String(),
                'creator' => [
                    'id' => $space->creator->id,
                    'name' => $space->creator->name,
                ],
                'members' => $space->members->map(fn (User $member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->pivot->role,
                    'joined_at' => $member->pivot->joined_at,
                ]),
                'documents' => $space->documents->map(fn ($doc) => [
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
                    'uploader' => [
                        'id' => $doc->uploader->id,
                        'name' => $doc->uploader->name,
                    ],
                ]),
            ],
            'availableUsers' => $availableUsers,
        ]);
    }

    public function update(StoreSpaceRequest $request, Space $space): RedirectResponse
    {
        if (!$space->isAdmin(Auth::user())) {
            abort(403);
        }

        $space->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Space updated successfully.']);

        return to_route('spaces.show', $space);
    }

    public function destroy(Space $space): RedirectResponse
    {
        if ($space->created_by !== Auth::id()) {
            abort(403);
        }

        $space->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Space deleted successfully.']);

        return to_route('spaces.index');
    }

    public function addMember(Request $request, Space $space): RedirectResponse
    {
        if (!$space->canEdit(Auth::user())) {
            abort(403);
        }

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'role' => ['required', 'in:contributor,viewer'],
        ]);

        $space->members()->syncWithoutDetaching([
            $request->input('user_id') => [
                'role' => $request->input('role'),
                'joined_at' => now(),
            ],
        ]);

        $addedUser = User::find($request->input('user_id'));
        Activity::log(
            Auth::user(),
            'member_added',
            "Added {$addedUser->name} to \"{$space->name}\"",
            $space,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Member added successfully.']);

        return to_route('spaces.show', $space);
    }

    public function removeMember(Space $space, User $user): RedirectResponse
    {
        if (!$space->canEdit(Auth::user()) && $user->id !== Auth::id()) {
            abort(403);
        }

        if ($user->id === $space->created_by) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot remove the space creator.']);
            return to_route('spaces.show', $space);
        }

        $space->members()->detach($user->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Member removed successfully.']);

        return to_route('spaces.show', $space);
    }

    public function uploadFile(Request $request, Space $space): RedirectResponse
    {
        if (!$space->canEdit(Auth::user())) {
            abort(403);
        }

        $request->validate([
            'file' => ['required', 'file', 'max:51200'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs('documents', $filename, 'local');

        $document = Document::create([
            'title' => $request->input('title') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $filePath,
            'file_type' => $file->getClientOriginalExtension(),
            'file_size' => $file->getSize(),
            'uploaded_by' => Auth::id(),
            'space_id' => $space->id,
            'status' => 'draft',
            'version' => 1,
        ]);

        event(new DocumentUploaded($document, Auth::id()));

        $document->createVersion(Auth::user());

        Activity::log(
            Auth::user(),
            'document_uploaded',
            "Uploaded \"{$document->title}\" to \"{$space->name}\"",
            $document,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File uploaded successfully.']);

        return to_route('spaces.show', $space);
    }
}
