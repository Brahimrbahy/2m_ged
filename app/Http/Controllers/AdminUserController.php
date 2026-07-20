<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->select('id', 'email', 'full_name', 'name', 'role', 'department', 'status', 'created_at');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $users = $query->latest()
            ->paginate(15)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'name' => $user->name,
                'role' => $user->role,
                'department' => $user->department,
                'status' => $user->status,
                'created_at' => $user->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/Users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/EditUser', [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'name' => $user->name,
                'role' => $user->role,
                'department' => $user->department,
                'status' => $user->status,
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $user->update([
            'full_name' => $validated['full_name'],
            'name' => $validated['full_name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'status' => $validated['status'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "User {$user->full_name} updated successfully."]);

        return to_route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You cannot deactivate your own account.']);
            return back();
        }

        $user->update(['status' => 'inactive']);

        Inertia::flash('toast', ['type' => 'success', 'message' => "User {$user->full_name} has been deactivated."]);

        return to_route('admin.users.index');
    }
}
