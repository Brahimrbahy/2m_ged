<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $spaceId = $request->input('space_id');

        $announcements = Announcement::published()
            ->with('creator:id,name', 'targetSpace:id,name')
            ->bySpace($spaceId)
            ->pinnedFirst()
            ->paginate(12)
            ->through(fn (Announcement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'excerpt' => $a->excerpt,
                'status' => $a->status,
                'is_pinned' => $a->is_pinned,
                'created_at' => $a->created_at->toIso8601String(),
                'updated_at' => $a->updated_at->toIso8601String(),
                'can_edit' => $a->canEdit($user),
                'creator' => [
                    'id' => $a->creator->id,
                    'name' => $a->creator->name,
                ],
                'target_space' => $a->targetSpace ? [
                    'id' => $a->targetSpace->id,
                    'name' => $a->targetSpace->name,
                ] : null,
            ]);

        return Inertia::render('announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['space_id']),
        ]);
    }

    public function create(): Response
    {
        $user = Auth::user();

        if (! $user->isAdmin() && ! $user->isManager()) {
            abort(403);
        }

        $spaces = $user->spaces()->select('spaces.id', 'spaces.name')->get();

        return Inertia::render('announcements/Create', [
            'spaces' => $spaces,
        ]);
    }

    public function store(StoreAnnouncementRequest $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->isAdmin() && ! $user->isManager()) {
            abort(403);
        }

        $announcement = Announcement::create([
            'created_by' => $user->id,
            'title' => $request->input('title'),
            'content' => $request->input('content'),
            'target_space_id' => $request->input('target_space_id'),
            'is_pinned' => $request->boolean('is_pinned'),
            'status' => $request->input('status', 'draft'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Announcement created successfully.']);

        return to_route('announcements.show', $announcement);
    }

    public function show(Announcement $announcement): Response
    {
        if ($announcement->status !== 'published') {
            Gate::authorize('update', $announcement);
        }

        $user = Auth::user();

        $announcement->load('creator:id,name', 'targetSpace:id,name');

        return Inertia::render('announcements/Show', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'status' => $announcement->status,
                'is_pinned' => $announcement->is_pinned,
                'created_at' => $announcement->created_at->toIso8601String(),
                'updated_at' => $announcement->updated_at->toIso8601String(),
                'can_edit' => $announcement->canEdit($user),
                'creator' => [
                    'id' => $announcement->creator->id,
                    'name' => $announcement->creator->name,
                ],
                'target_space' => $announcement->targetSpace ? [
                    'id' => $announcement->targetSpace->id,
                    'name' => $announcement->targetSpace->name,
                ] : null,
            ],
        ]);
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('delete', $announcement);

        $announcement->update(['status' => 'archived']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Announcement archived.']);

        return to_route('announcements.index');
    }
}
