<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ClassModel;
use App\Models\User;

class ClassPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin pode ver todas as aulas, instrutor pode ver apenas as suas
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClassModel $class): bool
    {
        // Admin pode ver qualquer aula, instrutor pode ver apenas as suas
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $class->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin e instructors podem criar aulas
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ClassModel $class): bool
    {
        // Admin pode editar qualquer aula, instrutor pode editar apenas as suas
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $class->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClassModel $class): bool
    {
        // Apenas admin pode deletar aulas
        return $user->role === UserRole::ADMIN;
    }

    /**
     * Determine whether the user can manage students in the class.
     */
    public function manageStudents(User $user, ClassModel $class): bool
    {
        // Admin pode gerenciar alunos em qualquer aula, instrutor apenas nas suas
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $class->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can choose instructor for the class.
     */
    public function chooseInstructor(User $user): bool
    {
        // Apenas admin pode escolher instrutor, instructors ficam fixos
        return $user->role === UserRole::ADMIN;
    }
} 