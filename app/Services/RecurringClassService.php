<?php

namespace App\Services;

use App\Models\ClassModel;
use App\Models\RecurringClass;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RecurringClassService
{
    /**
     * Gera todas as aulas para o período especificado da aula recorrente
     */
    public function generateRecurrences(RecurringClass $recurringClass): int
    {
        $startDate = Carbon::parse($recurringClass->start_date);
        $endDate = Carbon::parse($recurringClass->end_date);
        $createdCount = 0;

        Log::info("Generating recurrences for {$recurringClass->title} from {$startDate->format('Y-m-d')} to {$endDate->format('Y-m-d')}");

        // Encontra todas as datas que correspondem ao dia da semana no período
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            // Converte para o formato correto (Carbon: 0=domingo, 1=segunda)
            // Nossa base: 1=domingo, 2=segunda, etc.
            $carbonDayOfWeek = $recurringClass->day_of_week == 1 ? 0 : $recurringClass->day_of_week - 1;
            
            if ($currentDate->dayOfWeek == $carbonDayOfWeek) {
                // Combina data e hora
                $classStartTime = $currentDate->copy()->setTimeFromTimeString($recurringClass->start_time->format('H:i:s'));
                $classEndTime = $currentDate->copy()->setTimeFromTimeString($recurringClass->end_time->format('H:i:s'));

                // Verifica se a aula já existe
                $existingClass = ClassModel::where('recurring_class_id', $recurringClass->id)
                    ->where('start_time', $classStartTime)
                    ->first();

                if (!$existingClass) {
                    ClassModel::create([
                        'title' => $recurringClass->title,
                        'instructor_id' => $recurringClass->instructor_id,
                        'max_students' => $recurringClass->max_students,
                        'start_time' => $classStartTime,
                        'end_time' => $classEndTime,
                        'status' => 'scheduled',
                        'recurring_class_id' => $recurringClass->id,
                    ]);

                    $createdCount++;
                    Log::info("Created class for {$classStartTime->format('Y-m-d H:i')}");
                }
            }

            $currentDate->addDay();
        }

        Log::info("Generated {$createdCount} classes for {$recurringClass->title}");
        return $createdCount;
    }

    /**
     * Remove todas as aulas vinculadas a uma aula recorrente, exceto as já concluídas/canceladas
     */
    public function deleteRecurrences(RecurringClass $recurringClass): int
    {
        $deletedCount = ClassModel::where('recurring_class_id', $recurringClass->id)
            ->whereIn('status', ['scheduled']) // Remove apenas aulas agendadas
            ->delete();

        Log::info("Deleted {$deletedCount} scheduled classes for recurring class {$recurringClass->id}");
        return $deletedCount;
    }
}
