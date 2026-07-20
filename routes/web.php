<?php

use App\Http\Controllers\AdminImportController;
use App\Http\Controllers\AdminStatisticsController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentShareController;
use App\Http\Controllers\DocumentVersionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SpaceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.alt');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/create', fn () => Inertia::render('documents/Upload'))->name('documents.create');
    Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
    Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::post('/documents/{document}/share', [DocumentShareController::class, 'share'])->name('documents.share');
    Route::get('/documents/{document}/shares', [DocumentShareController::class, 'getShares'])->name('documents.shares');
    Route::delete('/documents/{document}/shares/{user}', [DocumentShareController::class, 'unshare'])->name('documents.unshare');

    Route::get('/documents/{document}/versions', [DocumentVersionController::class, 'index'])->name('documents.versions.index');
    Route::get('/documents/{document}/versions/create', fn () => Inertia::render('documents/Upload'))->name('documents.versions.create');
    Route::get('/documents/{document}/versions/{version}', [DocumentVersionController::class, 'show'])->name('documents.versions.show');
    Route::get('/documents/{document}/versions/{version}/download', [DocumentVersionController::class, 'download'])->name('documents.versions.download');
    Route::post('/documents/{document}/versions/{version}/restore', [DocumentVersionController::class, 'restore'])->name('documents.versions.restore');

    Route::resource('spaces', SpaceController::class);
    Route::post('/spaces/{space}/members', [SpaceController::class, 'addMember'])->name('spaces.members.store');
    Route::delete('/spaces/{space}/members/{user}', [SpaceController::class, 'removeMember'])->name('spaces.members.destroy');

    Route::get('/search', [SearchController::class, 'search'])->name('search');
    Route::get('/search/instant', [SearchController::class, 'instant'])->name('search.instant');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/notifications/recent', [NotificationController::class, 'recent'])->name('notifications.recent');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');

    Route::get('/announcements/create', [AnnouncementController::class, 'create'])->name('announcements.create');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::resource('announcements', AnnouncementController::class)->only(['index', 'show']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // Manager routes (admin + manager)
    Route::middleware('manager')->prefix('manager')->name('manager.')->group(function () {
        Route::get('/dashboard', fn () => Inertia::render('manager/Dashboard'))->name('dashboard');
        Route::get('/documents', fn () => Inertia::render('manager/Documents'))->name('documents');
        Route::get('/users', fn () => Inertia::render('manager/Users'))->name('users');
    });

    // Admin routes
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminStatisticsController::class, 'statistics'])->name('dashboard');
        Route::resource('users', AdminUserController::class);
        Route::post('users/import', [AdminImportController::class, 'import'])->name('users.import');
        Route::get('/settings', fn () => Inertia::render('admin/Settings'))->name('settings');
    });
});

require __DIR__.'/settings.php';
