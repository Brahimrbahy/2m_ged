<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->string('slug')->after('name')->nullable();
        });

        // Generate slugs for existing spaces
        foreach (\App\Models\Space::all() as $space) {
            $slug = Str::slug($space->name);
            $original = $slug;
            $count = 1;
            while (\App\Models\Space::where('slug', $slug)->where('id', '!=', $space->id)->exists()) {
                $slug = $original . '-' . $count++;
            }
            $space->update(['slug' => $slug]);
        }

        Schema::table('spaces', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('spaces', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
