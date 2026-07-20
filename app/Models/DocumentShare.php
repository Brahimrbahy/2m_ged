<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $document_id
 * @property int $shared_with_user_id
 * @property string $permission_level
 * @property Carbon|null $expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Document $document
 * @property-read User $sharedWithUser
 */
class DocumentShare extends Model
{
    protected $fillable = [
        'document_id',
        'shared_with_user_id',
        'permission_level',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public const PERMISSIONS = [
        'view_only' => 'View Only',
        'can_comment' => 'Can Comment',
        'can_edit' => 'Can Edit',
        'can_delete' => 'Can Delete',
    ];

    public const PERMISSION_HIERARCHY = [
        'view_only' => 0,
        'can_comment' => 1,
        'can_edit' => 2,
        'can_delete' => 3,
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function sharedWithUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }

    public function hasExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasExpired()) {
            return false;
        }

        $requiredLevel = self::PERMISSION_HIERARCHY[$permission] ?? -1;
        $grantedLevel = self::PERMISSION_HIERARCHY[$this->permission_level] ?? -1;

        return $grantedLevel >= $requiredLevel;
    }
}
