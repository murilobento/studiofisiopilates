<?php

namespace App\Console\Commands;

use App\Models\ClassModel;
use App\Models\RecurringClass;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReplicateClassesForNextWeek extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:replicate-classes-for-next-week';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Replicates classes for the next week based on the recurring classes setup, including students.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting replication of classes for the next week...');
        Log::info('Starting recurring class replication task.');

        $activeRecurringClasses = RecurringClass::where('is_active', true)->get();

        if ($activeRecurringClasses->isEmpty()) {
            $this->info('No active recurring classes found. Exiting.');
            Log::info('No active recurring classes to process.');
            return;
        }

        // Define o período da próxima semana
        $nextWeekStart = Carbon::now()->addWeek()->startOfWeek();

        foreach ($activeRecurringClasses as $recurringClass) {
            // Calcula a data exata da aula na próxima semana
            $nextClassDate = $nextWeekStart->copy()->addDays($recurringClass->day_of_week - 1);

            // Verifica se a data da aula está dentro do período de validade do molde
            if ($nextClassDate->isBefore($recurringClass->start_date) || ($recurringClass->end_date && $nextClassDate->isAfter($recurringClass->end_date))) {
                continue; // Pula se estiver fora do intervalo de datas
            }
            
            // Combina data e hora para ter o start_time e end_time completos
            $nextStartTime = $nextClassDate->copy()->setTimeFromTimeString($recurringClass->start_time->format('H:i:s'));
            $nextEndTime = $nextClassDate->copy()->setTimeFromTimeString($recurringClass->end_time->format('H:i:s'));

            // 1. VERIFICA SE A AULA JÁ EXISTE PARA A PRÓXIMA SEMANA
            $classAlreadyExists = ClassModel::where('recurring_class_id', $recurringClass->id)
                ->where('start_time', $nextStartTime)
                ->exists();

            if ($classAlreadyExists) {
                $this->line("Class '{$recurringClass->title}' for {$nextStartTime->format('Y-m-d H:i')} already exists. Skipping.");
                continue;
            }

            // 2. CRIA A NOVA AULA (INSTÂNCIA)
            $newClass = ClassModel::create([
                'title' => $recurringClass->title,
                'instructor_id' => $recurringClass->instructor_id,
                'max_students' => $recurringClass->max_students,
                'start_time' => $nextStartTime,
                'end_time' => $nextEndTime,
                'status' => 'scheduled',
                'recurring_class_id' => $recurringClass->id,
            ]);

            $this->info("Created class '{$newClass->title}' for {$newClass->start_time->format('Y-m-d H:i')}.");

            // 3. REPLICA OS ALUNOS, SE APLICÁVEL
            if ($recurringClass->auto_replicate_students) {
                // Encontra a aula correspondente na semana ATUAL para usar como referência
                $currentWeekClassDate = Carbon::now()->startOfWeek()->addDays($recurringClass->day_of_week - 1);
                $currentStartTime = $currentWeekClassDate->copy()->setTimeFromTimeString($recurringClass->start_time->format('H:i:s'));

                $sourceClass = ClassModel::where('recurring_class_id', $recurringClass->id)
                    ->where('start_time', $currentStartTime)
                    ->with('students')
                    ->first();
                
                if ($sourceClass && $sourceClass->students->isNotEmpty()) {
                    $studentIds = $sourceClass->students->pluck('id');
                    $newClass->students()->attach($studentIds);
                    $this->line("-> Replicated {$studentIds->count()} students.");
                    Log::info("Replicated {$studentIds->count()} students for class ID {$newClass->id} from source class ID {$sourceClass->id}.");
                } else {
                    $this->line("-> No source class or no students to replicate for '{$recurringClass->title}'.");
                }
            }
        }

        $this->info('Class replication finished successfully.');
        Log::info('Recurring class replication task finished.');
    }
}
