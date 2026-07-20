<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $created_by
 * @property int|null $target_space_id
 * @property string $title
 * @property string $content
 * @property string $status
 * @property bool $is_pinned
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read User $creator
 * @property-read Space|null $targetSpace
 * @property-read \Illuminate\Database\Eloquent\Collection<AnnouncementComment> $comments
 */
class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'target_space_id',
        'title',
        'content',
        'status',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function targetSpace(): BelongsTo
    {
        return $this->belongsTo(Space::class, 'target_space_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AnnouncementComment::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeBySpace(Builder $query, ?int $spaceId): Builder
    {
        if (!$spaceId) {
            return $query;
        }

        return $query->where('target_space_id', $spaceId);
    }

    public function scopePinnedFirst(Builder $query): Builder
    {
        return $query->orderByRaw('is_pinned DESC, created_at DESC');
    }

    public function canEdit(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isManager() && $this->created_by === $user->id) {
            return true;
        }

        return false;
    }

    public function getExcerptAttribute(): string
    {
        $text = strip_tags($this->content);
        return strlen($text) > 200 ? substr($text, 0, 200) . '...' : $text;
    }
}
