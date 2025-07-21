<?php

namespace App\Services;

use App\Models\MonthlyPayment;
use App\Models\Student;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Verifica se já existem mensalidades para o período
     */
    public function checkExistingPayments(int $month, int $year): array
    {
        $referenceMonth = Carbon::create($year, $month, 1);
        
        // Buscar alunos ativos
        $activeStudents = Student::where('status', 'ativo')
            ->with(['plan', 'instructor'])
            ->get();

        // Verificar quantas mensalidades já existem
        $existingPayments = MonthlyPayment::whereYear('reference_month', $year)
            ->whereMonth('reference_month', $month)
            ->whereIn('student_id', $activeStudents->pluck('id'))
            ->count();

        $newStudents = $activeStudents->count() - $existingPayments;

        return [
            'has_existing' => $existingPayments > 0 ? 1 : 0,
            'existing_count' => $existingPayments,
            'total_students' => $activeStudents->count(),
            'new_students' => max(0, $newStudents),
        ];
    }

    /**
     * Gera mensalidades para um mês específico
     */
    public function generateMonthlyPayments(int $month, int $year): array
    {
        $referenceMonth = Carbon::create($year, $month, 1);
        $generatedPayments = collect();
        $alreadyExists = 0;

        // Buscar alunos ativos
        $activeStudents = Student::where('status', 'ativo')
            ->with(['plan', 'instructor'])
            ->get();

        foreach ($activeStudents as $student) {
            // Verificar se já existe mensalidade para este mês
            $existingPayment = MonthlyPayment::where('student_id', $student->id)
                ->whereYear('reference_month', $year)
                ->whereMonth('reference_month', $month)
                ->first();

            if (!$existingPayment) {
                try {
                    $payment = $this->createMonthlyPayment($student, $referenceMonth);
                    $generatedPayments->push($payment);
                } catch (\Exception $e) {
                    throw $e;
                }
            } else {
                $alreadyExists++;
            }
        }

        return [
            'created' => $generatedPayments,
            'already_exists' => $alreadyExists,
            'total_students' => $activeStudents->count(),
        ];
    }

    /**
     * Cria uma mensalidade para um aluno específico
     */
    public function createMonthlyPayment(Student $student, Carbon $referenceMonth): MonthlyPayment
    {
        $amount = $student->custom_price ?? $student->plan->price;
        $dueDate = $this->calculateDueDate($referenceMonth);

        $paymentData = [
            'student_id' => $student->id,
            'plan_id' => $student->plan_id,
            'instructor_id' => $student->instructor_id,
            'amount' => $amount,
            'original_amount' => $amount,
            'due_date' => $dueDate,
            'reference_month' => $referenceMonth->format('Y-m-01'),
            'status' => 'pending',
            'is_automatic' => true,
        ];

        return MonthlyPayment::create($paymentData);
    }

    /**
     * Calcula a data de vencimento baseada no mês de referência
     * Sempre retorna o último dia do mês
     */
    public function calculateDueDate(Carbon $referenceMonth, int $dayOfMonth = null): Carbon
    {
        // Sempre usar o último dia do mês, independente do parâmetro dayOfMonth
        return $referenceMonth->copy()->endOfMonth();
    }

    /**
     * Processa pagamento de uma mensalidade
     */
    public function processPayment(
        MonthlyPayment $payment, 
        string $paymentMethod, 
        ?float $amountPaid = null,
        ?string $notes = null,
        ?string $receiptNumber = null
    ): bool {
        try {
            DB::beginTransaction();

            // Se não informou valor, usa o valor total da mensalidade
            $amountPaid = $amountPaid ?? $payment->total_amount;

            // Verificar se o valor pago cobre o total
            if ($amountPaid < $payment->total_amount) {
                throw new \Exception('Valor pago é menor que o valor total da mensalidade');
            }

            $payment->markAsPaid($paymentMethod, $notes, $receiptNumber);

            // Dispara o evento de pagamento confirmado
            event(new \App\Events\PaymentConfirmed($payment));
            
            // Calcula comissão automaticamente e registra transação financeira
            // Este código é mantido para compatibilidade, mas será substituído pelo listener
            if (app()->has('App\Services\CommissionService') && app()->has('App\Services\FinancialService')) {
                app('App\Services\CommissionService')->calculateCommission($payment);
                app('App\Services\FinancialService')->recordPaymentTransaction($payment);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Atualiza status de mensalidades em atraso
     */
    public function updateOverduePayments(): int
    {
        $updatedCount = 0;

        $pendingPayments = MonthlyPayment::pending()
            ->where('due_date', '<', today())
            ->get();

        foreach ($pendingPayments as $payment) {
            $payment->markAsOverdue();
            $updatedCount++;
        }

        return $updatedCount;
    }

    /**
     * Aplica multa e juros em mensalidades em atraso
     */
    public function applyLateFees(float $feePercentage = 2.0, float $dailyRate = 0.033): int
    {
        $updatedCount = 0;

        $overduePayments = MonthlyPayment::overdue()->get();

        foreach ($overduePayments as $payment) {
            $payment->applyLateFeeAndInterest($feePercentage, $dailyRate);
            $updatedCount++;
        }

        return $updatedCount;
    }

    /**
     * Busca mensalidades por filtros
     */
    public function searchPayments(array $filters = []): Collection
    {
        $query = MonthlyPayment::with(['student', 'plan', 'instructor']);

        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }

        if (isset($filters['instructor_id'])) {
            $query->where('instructor_id', $filters['instructor_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['month']) && isset($filters['year'])) {
            $query->byMonth($filters['month'], $filters['year']);
        }

        if (isset($filters['due_date_from'])) {
            $query->where('due_date', '>=', $filters['due_date_from']);
        }

        if (isset($filters['due_date_to'])) {
            $query->where('due_date', '<=', $filters['due_date_to']);
        }

        return $query->orderBy('due_date', 'desc')->get();
    }

    /**
     * Gera relatório de mensalidades por período
     */
    public function generatePaymentReport(Carbon $startDate, Carbon $endDate): array
    {
        $payments = MonthlyPayment::with(['student', 'plan', 'instructor'])
            ->whereBetween('reference_month', [$startDate->format('Y-m-01'), $endDate->format('Y-m-01')])
            ->get();

        $totalPaid = $payments->where('status', 'paid')->sum('amount');
        $totalPending = $payments->where('status', 'pending')->sum('amount');
        $totalOverdue = $payments->where('status', 'overdue')->sum('amount');

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_payments' => $payments->count(),
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'total_overdue' => $totalOverdue,
                'total_expected' => $payments->sum('amount'),
            ],
            'by_status' => [
                'paid' => $payments->where('status', 'paid')->count(),
                'pending' => $payments->where('status', 'pending')->count(),
                'overdue' => $payments->where('status', 'overdue')->count(),
                'cancelled' => $payments->where('status', 'cancelled')->count(),
            ],
            'by_instructor' => $payments->groupBy('instructor_id')->map(function ($instructorPayments) {
                return [
                    'instructor' => $instructorPayments->first()->instructor->name,
                    'total_payments' => $instructorPayments->count(),
                    'total_amount' => $instructorPayments->sum('amount'),
                    'paid_amount' => $instructorPayments->where('status', 'paid')->sum('amount'),
                ];
            })->values(),
            'payments' => $payments,
        ];
    }

    /**
     * Cancela mensalidade
     */
    public function cancelPayment(MonthlyPayment $payment, string $reason = null): bool
    {
        try {
            $payment->cancel($reason);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
    
    /**
     * Desfaz um pagamento, retornando para o status pendente
     */
    public function undoPayment(MonthlyPayment $payment, string $reason = null): bool
    {
        try {
            DB::beginTransaction();
            
            $payment->undoPayment($reason);
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    
    /**
     * Estorna um cancelamento, retornando para o status pendente
     */
    public function undoCancel(MonthlyPayment $payment, string $reason = null): bool
    {
        try {
            DB::beginTransaction();
            
            $payment->undoCancel($reason);
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Recalcula valor da mensalidade baseado no plano atual do aluno
     */
    public function recalculatePaymentAmount(MonthlyPayment $payment): bool
    {
        if ($payment->status === 'paid') {
            return false; // Não recalcular mensalidades já pagas
        }

        $student = $payment->student;
        $newAmount = $student->custom_price ?? $student->plan->price;

        $payment->update([
            'amount' => $newAmount,
            'original_amount' => $newAmount,
            'plan_id' => $student->plan_id,
        ]);

        return true;
    }

    /**
     * Busca mensalidades vencendo em breve
     */
    public function getPaymentsDueSoon(int $days = 7): Collection
    {
        return MonthlyPayment::with(['student', 'plan', 'instructor'])
            ->dueSoon($days)
            ->pending()
            ->orderBy('due_date')
            ->get();
    }

    /**
     * Busca mensalidades vencidas
     */
    public function getOverduePayments(): Collection
    {
        return MonthlyPayment::with(['student', 'plan', 'instructor'])
            ->overdue()
            ->orderBy('due_date')
            ->get();
    }

    /**
     * Calcula estatísticas de pagamento para dashboard
     */
    public function getDashboardStats(?int $instructorId = null): array
    {
        $query = MonthlyPayment::query();
        
        // Filtrar por instrutor se especificado
        if ($instructorId) {
            $query->where('instructor_id', $instructorId);
        }
        
        $allPayments = $query->get();
        
        $totalPending = $allPayments->where('status', 'pending')->count();
        $totalPaid = $allPayments->where('status', 'paid')->count();
        $totalOverdue = $allPayments->where('status', 'overdue')->count();
        
        $amountPending = (float) $allPayments->where('status', 'pending')->sum('amount');
        $amountPaid = (float) $allPayments->where('status', 'paid')->sum('amount');
        $amountOverdue = (float) $allPayments->where('status', 'overdue')->sum('amount');
        
        return [
            'total_pending' => $totalPending,
            'total_paid' => $totalPaid,
            'total_overdue' => $totalOverdue,
            'amount_pending' => $amountPending,
            'amount_paid' => $amountPaid,
            'amount_overdue' => $amountOverdue,
        ];
    }
} 