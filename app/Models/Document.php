<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'space_id',
        'status',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'version' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(DocumentShare::class);
    }

    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'document_shares', 'document_id', 'shared_with_user_id')
            ->withPivot('permission_level', 'expires_at')
            ->withTimestamps();
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->orderByDesc('version_number');
    }

    public function createVersion(User $user, ?string $description = null): DocumentVersion
    {
        $versionNumber = $this->versions()->max('version_number') ?? 0;

        return $this->versions()->create([
            'version_number' => $versionNumber + 1,
            'file_path' => $this->file_path,
            'file_size' => $this->file_size,
            'created_by' => $user->id,
            'description' => $description,
        ]);
    }

    public function restoreVersion(DocumentVersion $version, User $user): DocumentVersion
    {
        $newVersionNumber = $this->version + 1;

        $this->update([
            'file_path' => $version->file_path,
            'file_size' => $version->file_size,
            'version' => $newVersionNumber,
        ]);

        return $this->versions()->create([
            'version_number' => $newVersionNumber,
            'file_path' => $version->file_path,
            'file_size' => $version->file_size,
            'created_by' => $user->id,
            'description' => "Restored from v{$version->version_number}",
        ]);
    }

    public function getShareForUser(User $user): ?DocumentShare
    {
        return $this->shares()
            ->where('shared_with_user_id', $user->id)
            ->first();
    }

    public function canView(User $user): bool
    {
        if ($this->uploaded_by === $user->id || $user->isAdmin()) {
            return true;
        }

        if ($this->space_id && $this->space->created_by === $user->id) {
            return true;
        }

        if ($this->space_id && $this->space->members()->where('user_id', $user->id)->exists()) {
            return true;
        }

        $share = $this->getShareForUser($user);

        return $share && !$share->hasExpired();
    }

    public function canEdit(User $user): bool
    {
        if ($this->uploaded_by === $user->id || $user->isAdmin()) {
            return true;
        }

        if ($this->space_id && $this->space->created_by === $user->id) {
            return true;
        }

        $share = $this->getShareForUser($user);

        return $share && !$share->hasExpired() && $share->hasPermission('can_edit');
    }

    public function canDelete(User $user): bool
    {
        if ($this->uploaded_by === $user->id || $user->isAdmin()) {
            return true;
        }

        if ($this->space_id && $this->space->created_by === $user->id) {
            return true;
        }

        $share = $this->getShareForUser($user);

        return $share && !$share->hasExpired() && $share->hasPermission('can_delete');
    }

    public function getUrl(): string
    {
        return \Storage::disk('documents')->url($this->file_path);
    }

    public function getFileIcon(): string
    {
        return match (true) {
            str_contains($this->file_type, 'pdf') => 'FileText',
            in_array($this->file_type, ['doc', 'docx']) => 'FileText',
            in_array($this->file_type, ['xls', 'xlsx']) => 'FileSpreadsheet',
            in_array($this->file_type, ['ppt', 'pptx']) => 'Presentation',
            in_array($this->file_type, ['jpg', 'jpeg', 'png', 'gif']) => 'Image',
            default => 'Paperclip',
        };
    }

    public function canAccess(User $user): bool
    {
        if ($this->uploaded_by === $user->id) {
            return true;
        }

        if ($this->space_id && $this->space->created_by === $user->id) {
            return true;
        }

        if ($this->space_id && $this->space->members()->where('user_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' B';
    }

    public function scopeSearchable(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    public function scopeByFileType(Builder $query, ?string $fileType): Builder
    {
        if (!$fileType) {
            return $query;
        }

        $typeMap = [
            'pdf' => ['pdf'],
            'word' => ['doc', 'docx'],
            'excel' => ['xls', 'xlsx'],
            'powerpoint' => ['ppt', 'pptx'],
            'image' => ['jpg', 'jpeg', 'png', 'gif'],
        ];

        $extensions = $typeMap[strtolower($fileType)] ?? [$fileType];

        return $query->whereIn('file_type', $extensions);
    }

    public function scopeBySpace(Builder $query, $space): Builder
    {
        if (!$space) {
            return $query;
        }

        return $query->where('space_id', $space instanceof Model ? $space->id : $space);
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where(function ($q) use ($user) {
            $q->where('uploaded_by', $user->id)
              ->orWhereHas('space', function ($sq) use ($user) {
                  $sq->where('created_by', $user->id)
                     ->orWhereHas('members', fn ($m) => $m->where('user_id', $user->id));
              });
        });
    }

    public function scopeDateRange(Builder $query, ?string $range): Builder
    {
        if (!$range || $range === 'all') {
            return $query;
        }

        return match ($range) {
            'today' => $query->whereDate('created_at', Carbon::today()),
            'week' => $query->where('created_at', '>=', Carbon::now()->startOfWeek()),
            'month' => $query->where('created_at', '>=', Carbon::now()->startOfMonth()),
            default => $query,
        };
    }
}
