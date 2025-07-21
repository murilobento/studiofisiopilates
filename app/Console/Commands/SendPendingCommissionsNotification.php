<?php

namespace App\Console\Commands;

use App\Models\CommissionEntry;
use App\Models\User;
use App\Notifications\PendingCommissionsNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendPendingCommissionsNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-pending-commissions-notification {--days=30 : Número de dias para considerar comissões pendentes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envia notificações sobre comissões pendentes para administradores';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $this->info("Verificando comissões pendentes dos últimos {$days} dias...");
        
        // Busca comissões pendentes
        $pendingCommissions = CommissionEntry::with(['instructor', 'monthlyPayment.student'])
            ->where('status', 'pending')
            ->where('created_at', '>=', now()->subDays($days))
            ->get();
            
        if ($pendingCommissions->isEmpty()) {
            $this->info('Nenhuma comissão pendente encontrada.');
            return 0;
        }
        
        $totalAmount = $pendingCommissions->sum('commission_amount');
        $this->info("Encontradas {$pendingCommissions->count()} comissões pendentes, totalizando R$ " . number_format($totalAmount, 2, ',', '.'));
        
        // Busca administradores para enviar notificações
        $admins = User::where('role', 'admin')->get();
        
        if ($admins->isEmpty()) {
            $this->error('Não há administradores para enviar notificações.');
            return 1;
        }
        
        // Agrupa comissões por instrutor para o relatório
        $commissionsByInstructor = $pendingCommissions->groupBy('instructor_id')
            ->map(function ($group) {
                $instructor = $group->first()->instructor;
                return [
                    'instructor' => $instructor->name,
                    'count' => $group->count(),
                    'total' => $group->sum('commission_amount'),
                ];
            })
            ->values();
            
        // Exibe resumo por instrutor
        $this->info("\nResumo por instrutor:");
        foreach ($commissionsByInstructor as $item) {
            $this->line("- {$item['instructor']}: {$item['count']} comissões, R$ " . number_format($item['total'], 2, ',', '.'));
        }
        
        // Envia notificação para cada administrador
        $this->info("\nEnviando notificações para {$admins->count()} administradores...");
        foreach ($admins as $admin) {
            $admin->notify(new PendingCommissionsNotification($pendingCommissions, $totalAmount));
        }
        
        $this->info('Notificações enviadas com sucesso!');
        Log::info("Enviadas notificações de comissões pendentes para {$admins->count()} administradores. Total: {$pendingCommissions->count()} comissões, R$ " . number_format($totalAmount, 2, ',', '.'));
        
        return 0;
    }
}
