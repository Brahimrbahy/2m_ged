<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/Settings', [
            'settings' => $this->settings(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = Validator::make($request->all(), [
            'app.name' => ['required', 'string', 'max:255'],
            'app.support_email' => ['required', 'email', 'max:255'],
            'app.default_locale' => ['required', 'in:en,fr,ar'],
            'app.date_format' => ['required', 'in:Y-m-d,d/m/Y,m/d/Y,d M Y'],
            'documents.max_upload_size' => ['required', 'integer', 'min:1', 'max:5120'],
            'documents.allowed_file_types' => ['required', 'string', 'max:500'],
            'spaces.default_visibility' => ['required', 'in:public,private'],
            'spaces.user_storage_quota' => ['required', 'integer', 'min:0', 'max:1048576'],
            'users.allow_registration' => ['required', 'boolean'],
            'users.default_role' => ['required', 'in:admin,manager,user'],
            'users.require_email_verification' => ['required', 'boolean'],
        ])->validate();

        foreach ($validated as $group => $values) {
            foreach ($values as $key => $value) {
                Setting::set("{$group}.{$key}", $value);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Settings saved successfully.']);

        return to_route('admin.settings');
    }

    private function settings(): array
    {
        $flattened = [];

        foreach (config('settings') as $group => $values) {
            foreach ($values as $key => $default) {
                $flattened["{$group}.{$key}"] = Setting::get("{$group}.{$key}", $default);
            }
        }

        return [
            'app' => [
                'name' => $flattened['app.name'],
                'support_email' => $flattened['app.support_email'],
                'default_locale' => $flattened['app.default_locale'],
                'date_format' => $flattened['app.date_format'],
            ],
            'documents' => [
                'max_upload_size' => (int) $flattened['documents.max_upload_size'],
                'allowed_file_types' => $flattened['documents.allowed_file_types'],
            ],
            'spaces' => [
                'default_visibility' => $flattened['spaces.default_visibility'],
                'user_storage_quota' => (int) $flattened['spaces.user_storage_quota'],
            ],
            'users' => [
                'allow_registration' => filter_var($flattened['users.allow_registration'], FILTER_VALIDATE_BOOLEAN),
                'default_role' => $flattened['users.default_role'],
                'require_email_verification' => filter_var($flattened['users.require_email_verification'], FILTER_VALIDATE_BOOLEAN),
            ],
        ];
    }
}
