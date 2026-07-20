<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'full_name' => 'Admin User',
            'email' => 'admin@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'admin',
            'department' => 'Management',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Manager User',
            'full_name' => 'Manager User',
            'email' => 'manager@test.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'manager',
            'department' => 'Engineering',
            'status' => 'active',
        ]);

        User::factory()->count(3)->create([
            'role' => 'user',
        ]);
    }
}
