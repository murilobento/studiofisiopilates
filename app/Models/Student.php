<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class Student extends Model
{
    protected $fillable = [
        'instructor_id',
        'name',
        'email',
        'phone',
        'plan_id',
        'custom_price',
        'status',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
        'zip_code',
        'gender',
        'cpf',
        'medical_conditions',
        'medications',
        'allergies',
        'pilates_goals',
        'physical_activity_history',
        'general_notes',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ClassModel::class, 'class_student', 'student_id', 'class_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    // Methods
    public function weeklyEnrollmentCount(Carbon $weekStart = null): int
    {
        $start = $weekStart ?: Carbon::now()->startOfWeek();
        $end = $start->copy()->endOfWeek();
        
        return $this->classes()
                    ->whereBetween('start_time', [$start, $end])
                    ->wherePivot('status', 'enrolled')
                    ->count();
    }

    public function canEnrollInClass(ClassModel $class): bool
    {
        $weekStart = $class->start_time->startOfWeek();
        $currentEnrollments = $this->weeklyEnrollmentCount($weekStart);
        
        // Verifica se o aluno tem um plano e se ainda pode se inscrever
        if (!$this->plan) {
            return false;
        }

        // Usa o campo 'frequency' do plano, que representa quantas aulas por semana o aluno pode fazer
        $weeklyLimit = $this->plan->frequency ?? 0; // 0 = ilimitado

        // Se não houver limite definido, permite inscrição
        if ($weeklyLimit === 0) {
            return true;
        }

        return $currentEnrollments < $weeklyLimit;
    }
}
