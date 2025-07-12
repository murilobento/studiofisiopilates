<?php

namespace App\Services;

use App\Models\ClassModel;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ClassEnrollmentService
{
    public function canEnrollStudent(int $studentId, int $classId): bool
    {
        $student = Student::find($studentId);
        $class = ClassModel::find($classId);

        if (!$student || !$class) {
            return false;
        }

        // Verificar se a aula ainda aceita inscrições
        if (!$class->canAddStudent()) {
            return false;
        }

        // Verificar se o aluno já está inscrito
        if ($class->students()->where('student_id', $studentId)->exists()) {
            return false;
        }

        // Verificar se o aluno pode se inscrever baseado na frequência semanal
        return $student->canEnrollInClass($class);
    }

    public function getWeekEnrollments(int $studentId, Carbon $weekStart): int
    {
        $student = Student::find($studentId);
        
        if (!$student) {
            return 0;
        }

        return $student->weeklyEnrollmentCount($weekStart);
    }

    public function enrollStudent(int $classId, int $studentId): bool
    {
        if (!$this->canEnrollStudent($studentId, $classId)) {
            return false;
        }

        try {
            DB::beginTransaction();

            $class = ClassModel::find($classId);
            $class->students()->attach($studentId, [
                'status' => 'enrolled',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            return false;
        }
    }

    public function removeStudent(int $classId, int $studentId): bool
    {
        try {
            $class = ClassModel::find($classId);
            
            if (!$class || !$class->canBeModified()) {
                return false;
            }

            $class->students()->detach($studentId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function hasInstructorConflict(int $instructorId, Carbon $startTime, Carbon $endTime, int $excludeClassId = null): bool
    {
        $query = ClassModel::where('instructor_id', $instructorId)
            ->where('status', 'scheduled')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeClassId) {
            $query->where('id', '!=', $excludeClassId);
        }

        return $query->exists();
    }

    public function validateClassTime(Carbon $startTime, Carbon $endTime): array
    {
        $errors = [];

        // Verificar se é dia útil (segunda a sexta)
        if ($startTime->isWeekend()) {
            $errors[] = 'Aulas só podem ser agendadas de segunda a sexta-feira.';
        }

        // Verificar horário de funcionamento (07:00 - 21:00)
        $startHour = $startTime->hour;
        $endHour = $endTime->hour;
        $endMinute = $endTime->minute;

        if ($startHour < 7 || $endHour > 21 || ($endHour == 21 && $endMinute > 0)) {
            $errors[] = 'Aulas devem ser agendadas entre 07:00 e 21:00.';
        }

        // Verificar se end_time é posterior a start_time
        if ($endTime <= $startTime) {
            $errors[] = 'O horário de término deve ser posterior ao horário de início.';
        }

        // Verificar duração mínima (30 minutos)
        if ($startTime->diffInMinutes($endTime) < 30) {
            $errors[] = 'A aula deve ter duração mínima de 30 minutos.';
        }

        // Verificar duração máxima (120 minutos)
        if ($startTime->diffInMinutes($endTime) > 120) {
            $errors[] = 'A aula deve ter duração máxima de 2 horas.';
        }

        return $errors;
    }

    public function getAvailableStudentsForClass(int $classId): array
    {
        $class = ClassModel::with('students')->find($classId);
        
        if (!$class) {
            return [];
        }

        $enrolledStudentIds = $class->students->pluck('id')->toArray();
        $weekStart = $class->start_time->copy()->startOfWeek();

        return Student::whereIn('status', [true, 1, 'ativo'])
            ->whereNotIn('id', $enrolledStudentIds)
            ->get()
            ->filter(function ($student) use ($class) {
                return $student->canEnrollInClass($class);
            })
            ->values()
            ->toArray();
    }
} 