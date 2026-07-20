<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('name');
            $table->enum('role', ['admin', 'manager', 'user'])->default('user')->after('email');
            $table->string('department')->nullable()->after('role');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('department');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'role', 'department', 'status', 'last_login_at']);
        });
    }
};
