<?php

namespace App\Policies;

use App\Models\RecurringClass;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Auth\Access\Response;

class RecurringClassPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, RecurringClass $recurringClass): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $user->id === $recurringClass->instructor_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RecurringClass $recurringClass): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $user->id === $recurringClass->instructor_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RecurringClass $recurringClass): bool
    {
        if ($user->role === UserRole::ADMIN) {
            return true;
        }

        return $user->id === $recurringClass->instructor_id;
    }

    /**
     * Determine whether the user can choose instructor for the recurring class.
     */
    public function chooseInstructor(User $user): bool
    {
        // Apenas admin pode escolher instrutor, instructors ficam fixos
        return $user->role === UserRole::ADMIN;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, RecurringClass $recurringClass): bool
    {
        return $user->role === UserRole::ADMIN;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, RecurringClass $recurringClass): bool
    {
        return $user->role === UserRole::ADMIN;
    }
}
