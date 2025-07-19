<?php

namespace App\Console\Commands;

use App\Services\PaymentService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateMonthlyPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:generate 
                          {--month= : Mês para gerar as mensalidades (1-12)}
                          {--year= : Ano para gerar as mensalidades}
                          {--current : Gerar para o mês atual}
                          {--next : Gerar para o próximo mês}
                          {--force : Forçar geração mesmo se já existirem mensalidades}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gera mensalidades para alunos ativos em um mês específico';

    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        parent::__construct();
        $this->paymentService = $paymentService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🏦 Iniciando geração de mensalidades...');

        // Determinar mês e ano
        [$month, $year] = $this->determineMonthAndYear();

        $this->info("📅 Gerando mensalidades para {$month}/{$year}");

        try {
            // Gerar mensalidades
            $generatedPayments = $this->paymentService->generateMonthlyPayments($month, $year);

            if ($generatedPayments->isEmpty()) {
                $this->warn('⚠️  Nenhuma mensalidade foi gerada. Possíveis motivos:');
                $this->warn('   - Não há alunos ativos no sistema');
                $this->warn('   - Mensalidades já foram geradas para este período');
                $this->warn('   - Use --force para forçar a geração');
                return Command::SUCCESS;
            }

            // Exibir resultados
            $this->displayResults($generatedPayments, $month, $year);

            // Atualizar status de mensalidades em atraso
            $this->updateOverduePayments();

            $this->info('✅ Geração de mensalidades concluída com sucesso!');

        } catch (\Exception $e) {
            $this->error("❌ Erro ao gerar mensalidades: {$e->getMessage()}");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * Determina o mês e ano para geração
     */
    private function determineMonthAndYear(): array
    {
        if ($this->option('current')) {
            return [now()->month, now()->year];
        }

        if ($this->option('next')) {
            $nextMonth = now()->addMonth();
            return [$nextMonth->month, $nextMonth->year];
        }

        $month = $this->option('month') ?? now()->month;
        $year = $this->option('year') ?? now()->year;

        // Validar mês
        if ($month < 1 || $month > 12) {
            $this->error('❌ Mês deve estar entre 1 e 12');
            exit(Command::FAILURE);
        }

        return [(int) $month, (int) $year];
    }

    /**
     * Exibe os resultados da geração
     */
    private function displayResults($generatedPayments, int $month, int $year)
    {
        $monthName = Carbon::create($year, $month, 1)->format('F Y');
        
        $this->info("📊 Resumo da geração para {$monthName}:");
        $this->info("   💰 Total de mensalidades geradas: {$generatedPayments->count()}");
        
        $totalAmount = $generatedPayments->sum('amount');
        $this->info("   💵 Valor total: R$ " . number_format($totalAmount, 2, ',', '.'));

        // Agrupar por instrutor
        $byInstructor = $generatedPayments->groupBy('instructor_id');
        
        if ($byInstructor->count() > 1) {
            $this->info("\n📋 Por instrutor:");
            
            foreach ($byInstructor as $instructorId => $payments) {
                $instructor = $payments->first()->instructor;
                $count = $payments->count();
                $amount = $payments->sum('amount');
                
                $this->info("   👨‍🏫 {$instructor->name}: {$count} mensalidades (R$ " . number_format($amount, 2, ',', '.') . ")");
            }
        }

        // Mostrar algumas mensalidades geradas
        if ($generatedPayments->count() <= 10) {
            $this->info("\n📝 Mensalidades geradas:");
            foreach ($generatedPayments as $payment) {
                $this->info("   • {$payment->student->name} - R$ " . number_format($payment->amount, 2, ',', '.') . " (Venc: {$payment->due_date->format('d/m/Y')})");
            }
        } else {
            $this->info("\n📝 Primeiras 5 mensalidades geradas:");
            foreach ($generatedPayments->take(5) as $payment) {
                $this->info("   • {$payment->student->name} - R$ " . number_format($payment->amount, 2, ',', '.') . " (Venc: {$payment->due_date->format('d/m/Y')})");
            }
            $this->info("   ... e mais " . ($generatedPayments->count() - 5) . " mensalidades");
        }
    }

    /**
     * Atualiza status de mensalidades em atraso
     */
    private function updateOverduePayments()
    {
        $this->info("\n🔄 Atualizando status de mensalidades em atraso...");
        
        $overdueCount = $this->paymentService->updateOverduePayments();
        
        if ($overdueCount > 0) {
            $this->warn("⚠️  {$overdueCount} mensalidades marcadas como em atraso");
            
            // Aplicar multas e juros
            $this->info("💰 Aplicando multas e juros...");
            $feesApplied = $this->paymentService->applyLateFees();
            
            if ($feesApplied > 0) {
                $this->info("✅ Multas e juros aplicados em {$feesApplied} mensalidades");
            }
        } else {
            $this->info("✅ Nenhuma mensalidade em atraso encontrada");
        }
    }
}
