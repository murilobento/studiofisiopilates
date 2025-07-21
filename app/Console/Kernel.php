<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('app:replicate-classes-for-next-week')->weeklyOn(7, '1:00');
        
        // Verifica despesas com vencimento próximo diariamente às 8:00
        $schedule->job(new \App\Jobs\CheckExpenseDueJob(5))->dailyAt('08:00');
        
        // Envia notificações de comissões pendentes semanalmente às segundas-feiras às 9:00
        $schedule->command('app:send-pending-commissions-notification')->weeklyOn(1, '09:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
} 