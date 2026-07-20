<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Announcement;
use App\Models\Document;
use App\Models\DocumentShare;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $stats = [
            'documents' => Document::where('uploaded_by', $user->id)->count(),
            'spaces' => Space::where('created_by', $user->id)
                ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->count(),
            'team_members' => $this->getTeamMemberCount($user),
            'shared_documents' => DocumentShare::where('shared_with_user_id', $user->id)
                ->where('expires_at', '>', now())
                ->orWhereNull('expires_at')
                ->count(),
        ];

        $recentDocuments = Document::with('uploader', 'space')
            ->where('uploaded_by', $user->id)
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Document $doc) => [
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
                'can_share' => true,
                'shares_count' => $doc->shares()->count(),
                'uploader' => [
                    'id' => $doc->uploader->id,
                    'name' => $doc->uploader->name,
                ],
                'space' => $doc->space ? [
                    'id' => $doc->space->id,
                    'name' => $doc->space->name,
                ] : null,
            ]);

        $activities = Activity::with('user:id,name')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'description' => $activity->description,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'created_at' => $activity->created_at->toIso8601String(),
                'user' => [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                ],
            ]);

        $announcements = Announcement::published()
            ->with('creator:id,name')
            ->withCount('comments')
            ->pinnedFirst()
            ->limit(3)
            ->get()
            ->map(fn (Announcement $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'excerpt' => $a->excerpt,
                'status' => $a->status,
                'is_pinned' => $a->is_pinned,
                'created_at' => $a->created_at->toIso8601String(),
                'comments_count' => $a->comments_count,
                'creator' => [
                    'id' => $a->creator->id,
                    'name' => $a->creator->name,
                ],
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentDocuments' => $recentDocuments,
            'activities' => $activities,
            'announcements' => $announcements,
        ]);
    }

    private function getTeamMemberCount($user): int
    {
        if ($user->isAdmin()) {
            return \App\Models\User::count() - 1;
        }

        $spaceIds = Space::where('created_by', $user->id)
            ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->pluck('id');

        return \Illuminate\Support\Facades\DB::table('space_members')
            ->whereIn('space_id', $spaceIds)
            ->where('user_id', '!=', $user->id)
            ->distinct()
            ->count('user_id');
    }
}
