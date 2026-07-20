<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

class AnnouncementPolicy
{
    public function view(User $user, Announcement $announcement): bool
    {
        return $announcement->status === 'published' || $announcement->canEdit($user);
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $announcement->canEdit($user);
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $announcement->canEdit($user);
    }
}
