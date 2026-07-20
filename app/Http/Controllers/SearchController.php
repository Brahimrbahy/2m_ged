<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function search(Request $request): Response
    {
        $query = $request->input('q');
        $fileType = $request->input('file_type');
        $spaceId = $request->input('space_id');
        $dateRange = $request->input('date_range');

        $spaces = Space::byUser(Auth::user())->select('id', 'name')->get();

        $documents = Document::with('uploader', 'space')
            ->forUser(Auth::user())
            ->searchable($query)
            ->byFileType($fileType)
            ->bySpace($spaceId)
            ->dateRange($dateRange)
            ->latest()
            ->paginate(20)
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
                'uploader' => [
                    'id' => $doc->uploader->id,
                    'name' => $doc->uploader->name,
                ],
                'space' => $doc->space ? [
                    'id' => $doc->space->id,
                    'name' => $doc->space->name,
                ] : null,
            ]);

        return Inertia::render('Search', [
            'documents' => $documents,
            'spaces' => $spaces,
            'filters' => $request->only(['q', 'file_type', 'space_id', 'date_range']),
        ]);
    }

    public function instant(Request $request)
    {
        $query = $request->input('q');
        $type = $request->input('type');

        if (strlen($query) < 2) {
            return response()->json($type === 'users' ? ['users' => []] : []);
        }

        if ($type === 'users') {
            $users = User::where('status', 'active')
                ->where('id', '!=', Auth::id())
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%")
                      ->orWhere('full_name', 'like', "%{$query}%");
                })
                ->limit(10)
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->full_name ?: $user->name,
                    'email' => $user->email,
                ]);

            return response()->json(['users' => $users]);
        }

        $documents = Document::with('uploader', 'space')
            ->forUser(Auth::user())
            ->searchable($query)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Document $doc) => [
                'id' => $doc->id,
                'title' => $doc->title,
                'description' => $doc->description,
                'file_type' => $doc->file_type,
                'icon' => $doc->getFileIcon(),
                'formatted_size' => $doc->formatted_size,
                'created_at' => $doc->created_at->toIso8601String(),
                'uploader' => [
                    'id' => $doc->uploader->id,
                    'name' => $doc->uploader->name,
                ],
                'space' => $doc->space ? [
                    'id' => $doc->space->id,
                    'name' => $doc->space->name,
                ] : null,
            ]);

        return response()->json($documents);
    }
}
