<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_public',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::creating(function (Space $space) {
            if (empty($space->slug)) {
                $slug = Str::slug($space->name);
                $original = $slug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $original . '-' . $count++;
                }
                $space->slug = $slug;
            }
        });

        static::updating(function (Space $space) {
            if ($space->isDirty('name') && !$space->isDirty('slug')) {
                $slug = Str::slug($space->name);
                $original = $slug;
                $count = 1;
                while (static::where('slug', $slug)->where('id', '!=', $space->id)->exists()) {
                    $slug = $original . '-' . $count++;
                }
                $space->slug = $slug;
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_members')
            ->withPivot('role', 'joined_at')
            ->withTimestamps();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function userRole(User $user): ?string
    {
        if ($user->id === $this->created_by) {
            return 'admin';
        }

        $member = $this->members()->where('user_id', $user->id)->first();

        return $member?->pivot->role;
    }

    public function isAdmin(User $user): bool
    {
        return $this->userRole($user) === 'admin';
    }

    public function canEdit(User $user): bool
    {
        $role = $this->userRole($user);

        return in_array($role, ['admin', 'contributor']);
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopeByUser(Builder $query, User $user): Builder
    {
        return $query->where(function ($q) use ($user) {
            $q->where('created_by', $user->id)
              ->orWhereHas('members', fn ($m) => $m->where('user_id', $user->id));
        });
    }
}
