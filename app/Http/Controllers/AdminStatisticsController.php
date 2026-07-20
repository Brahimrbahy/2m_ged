<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminStatisticsController extends Controller
{
    public function statistics(): Response
    {
        $totalUsers = User::count();
        $totalDocuments = Document::count();
        $totalSpaces = Space::count();

        $activeUsersThisMonth = User::where('last_login_at', '>=', now()->startOfMonth())
            ->orWhere('created_at', '>=', now()->startOfMonth())
            ->count();

        $storageUsed = (int) Document::sum('file_size');

        $mostActiveSpaces = Space::withCount('documents')
            ->orderByDesc('documents_count')
            ->limit(10)
            ->get()
            ->map(fn (Space $space) => [
                'id' => $space->id,
                'name' => $space->name,
                'description' => $space->description,
                'documents_count' => $space->documents_count,
                'is_public' => $space->is_public,
            ]);

        $documentsByMonth = Document::where('created_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw("strftime('%Y-%m', created_at) as month"),
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get();

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_documents' => $totalDocuments,
                'total_spaces' => $totalSpaces,
                'active_users_this_month' => $activeUsersThisMonth,
                'storage_used' => $storageUsed,
                'storage_used_formatted' => $this->formatBytes($storageUsed),
            ],
            'mostActiveSpaces' => $mostActiveSpaces,
            'documentsByMonth' => $documentsByMonth,
            'usersByRole' => $usersByRole,
        ]);
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
        $power = min($power, count($units) - 1);
        $bytes /= pow(1024, $power);

        return round($bytes, 2) . ' ' . $units[$power];
    }
}
