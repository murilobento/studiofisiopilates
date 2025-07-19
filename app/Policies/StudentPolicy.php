<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Admin e instructors podem ver alunos
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Student $student): bool
    {
        // Admin pode ver qualquer aluno, instrutor pode ver apenas seus alunos
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $student->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Admin e instructors podem criar alunos
        return $user->role === UserRole::ADMIN || $user->role === UserRole::INSTRUCTOR;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Student $student): bool
    {
        // Admin pode editar qualquer aluno, instrutor pode editar apenas seus alunos
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $student->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Student $student): bool
    {
        // Admin pode deletar qualquer aluno, instrutor pode deletar apenas seus alunos
        return $user->role === UserRole::ADMIN || 
               ($user->role === UserRole::INSTRUCTOR && $student->instructor_id === $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Student $student): bool
    {
        // Apenas admin pode restaurar alunos
        return $user->role === UserRole::ADMIN;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Student $student): bool
    {
        // Apenas admin pode deletar permanentemente
        return $user->role === UserRole::ADMIN;
    }
}
