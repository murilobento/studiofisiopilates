<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'birth_date',
        'medical_conditions',
        'medications',
        'allergies',
        'pilates_goals',
        'physical_activity_history',
        'general_notes',
    ];

    /**
     * Atributos que devem ser adicionados ao array / JSON do modelo.
     * Isso garante que a idade calculada seja enviada para o front-end
     * sem necessidade de cálculo adicional no cliente.
     */
    protected $appends = [
        'age',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

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

    public function monthlyPayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class);
    }

    public function currentMonthPayment(): HasOne
    {
        return $this->hasOne(MonthlyPayment::class)
                    ->whereMonth('reference_month', now()->month)
                    ->whereYear('reference_month', now()->year);
    }

    public function pendingPayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class)->where('status', 'pending');
    }

    public function overduePayments(): HasMany
    {
        return $this->hasMany(MonthlyPayment::class)->where('status', 'overdue');
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

    /**
     * Calcula a idade do aluno baseada na data de nascimento
     */
    public function getAgeAttribute(): ?int
    {
        if (!$this->birth_date) {
            return null;
        }

        return (int) $this->birth_date->diffInYears(Carbon::now());
    }
}
