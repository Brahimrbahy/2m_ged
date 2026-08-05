<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ManagerUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->select('id', 'email', 'full_name', 'name', 'role', 'department', 'status', 'created_at');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
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

        return Inertia::render('manager/Users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'role' => ['required', Rule::in(['user', 'manager'])],
            'department' => ['nullable', 'string', 'max:255'],
        ]);

        $password = Str::password(12);

        $user = User::create([
            'name' => $validated['full_name'],
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'status' => 'active',
            'password' => Hash::make($password),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "User {$user->full_name} has been added.",
        ]);

        return to_route('manager.users');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You cannot remove your own account.']);
            return back();
        }

        if (auth()->user()?->role !== 'admin' && $user->role === 'admin') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You cannot remove an admin.']);
            return back();
        }

        $user->update(['status' => 'inactive']);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "User {$user->full_name} has been deactivated.",
        ]);

        return to_route('manager.users');
    }
}
