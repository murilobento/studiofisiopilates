<?php

namespace App\Jobs;

use App\Models\RecurringExpense;
use App\Models\User;
use App\Notifications\ExpenseDueNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckExpenseDueJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Número de dias para verificar vencimentos futuros.
     *
     * @var int
     */
    protected $daysAhead;

    /**
     * Create a new job instance.
     *
     * @param int $daysAhead Número de dias para verificar vencimentos futuros
     */
    public function __construct(int $daysAhead = 5)
    {
        $this->daysAhead = $daysAhead;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $currentDay = now()->day;
        $endDay = $currentDay + $this->daysAhead;
        
        // Busca despesas ativas com vencimento nos próximos dias
        $expenses = RecurringExpense::where('is_active', true)
            ->where(function ($query) use ($currentDay, $endDay) {
                // Verifica se o dia de vencimento está dentro do intervalo
                $query->whereBetween('due_day', [$currentDay, min($endDay, 31)]);
                
                // Trata o caso de virada de mês
                if ($endDay > 31) {
                    $query->orWhere('due_day', '<=', $endDay - 31);
                }
            })
            ->get();
            
        if ($expenses->isEmpty()) {
            Log::info('Nenhuma despesa com vencimento próximo encontrada.');
            return;
        }
        
        // Busca administradores para enviar notificações
        $admins = User::where('role', 'admin')->get();
        
        if ($admins->isEmpty()) {
            Log::warning('Não há administradores para enviar notificações de vencimento de despesas.');
            return;
        }
        
        $notificationCount = 0;
        
        // Processa cada despesa
        foreach ($expenses as $expense) {
            // Calcula dias até o vencimento
            $dueDay = $expense->due_day;
            $daysUntilDue = $dueDay - $currentDay;
            
            // Ajusta para virada de mês
            if ($daysUntilDue < 0) {
                $daysUntilDue = $dueDay + (now()->daysInMonth - $currentDay);
            }
            
            // Envia notificação para cada administrador
            foreach ($admins as $admin) {
                $admin->notify(new ExpenseDueNotification($expense, $daysUntilDue));
                $notificationCount++;
            }
        }
        
        Log::info("Enviadas {$notificationCount} notificações de vencimento de despesas para {$admins->count()} administradores.");
    }

    /**
     * The unique ID of the job.
     */
    public function uniqueId(): string
    {
        return 'check_expense_due_' . now()->format('Y-m-d');
    }
}
