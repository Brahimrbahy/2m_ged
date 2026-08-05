<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admin can view the system settings page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/Settings')
            ->has('settings.app', 4)
            ->has('settings.documents', 2)
            ->has('settings.spaces', 2)
            ->has('settings.users', 3));
});

test('non-admin users cannot access the system settings page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.settings'))
        ->assertForbidden();
});

test('admin can update system settings', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.settings.update'), [
            'app' => [
                'name' => '2M GED',
                'support_email' => 'admin@example.com',
                'default_locale' => 'fr',
                'date_format' => 'd/m/Y',
            ],
            'documents' => [
                'max_upload_size' => 50,
                'allowed_file_types' => 'pdf,doc,docx',
            ],
            'spaces' => [
                'default_visibility' => 'public',
                'user_storage_quota' => 2048,
            ],
            'users' => [
                'allow_registration' => true,
                'default_role' => 'manager',
                'require_email_verification' => false,
            ],
        ])
        ->assertRedirect(route('admin.settings'));

    expect(Setting::get('app.name'))->toBe('2M GED');
    expect(Setting::get('documents.max_upload_size'))->toBe('50');
    expect(Setting::get('spaces.default_visibility'))->toBe('public');
    expect(Setting::get('users.allow_registration'))->toBe('1');
});

test('system settings validation rejects invalid values', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.settings'))
        ->put(route('admin.settings.update'), [
            'app' => [
                'name' => '',
                'support_email' => 'not-an-email',
                'default_locale' => 'en',
                'date_format' => 'Y-m-d',
            ],
            'documents' => [
                'max_upload_size' => 0,
                'allowed_file_types' => 'pdf',
            ],
            'spaces' => [
                'default_visibility' => 'hidden',
                'user_storage_quota' => 100,
            ],
            'users' => [
                'allow_registration' => false,
                'default_role' => 'superuser',
                'require_email_verification' => true,
            ],
        ])
        ->assertSessionHasErrors([
            'app.name',
            'app.support_email',
            'documents.max_upload_size',
            'spaces.default_visibility',
            'users.default_role',
        ]);
});
