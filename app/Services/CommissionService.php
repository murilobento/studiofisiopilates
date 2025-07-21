<?php

namespace App\Services;

use App\Models\CommissionEntry;
use App\Models\FinancialTransaction;
use App\Models\MonthlyPayment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommissionService
{
    /**
     * Calcula a comissão para um pagamento confirmado.
     *
     * @param MonthlyPayment $payment
     * @return CommissionEntry|null
     */
    public function calculateCommission(MonthlyPayment $payment): ?CommissionEntry
    {
        try {
            DB::beginTransaction();
            
            // Verifica se já existe uma comissão para este pagamento
            $existingCommission = CommissionEntry::where('monthly_payment_id', $payment->id)->first();
            if ($existingCommission) {
                return $existingCommission;
            }
            
            // Verifica se o pagamento está confirmado
            if ($payment->status !== 'paid') {
                return null;
            }
            
            // Cria a entrada de comissão
            $commission = CommissionEntry::createFromPayment($payment);
            
            // Se a comissão foi criada com sucesso, registra a transação financeira
            if ($commission) {
                FinancialTransaction::createFromCommission($commission);
            }
            
            DB::commit();
            return $commission;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao calcular comissão: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'exception' => $e
            ]);
            return null;
        }
    }
    
    /**
     * Processa o pagamento de uma comissão.
     *
     * @param CommissionEntry $commission
     * @return bool
     */
    public function processCommissionPayment(CommissionEntry $commission): bool
    {
        try {
            DB::beginTransaction();
            
            // Marca a comissão como paga
            $commission->markAsPaid();
            
            // Atualiza a transação financeira existente ou cria uma nova
            $transaction = FinancialTransaction::where('reference_id', $commission->id)
                ->where('reference_type', get_class($commission))
                ->first();
                
            if ($transaction) {
                $transaction->update([
                    'transaction_date' => $commission->paid_at,
                    'description' => "Comissão paga - {$commission->instructor->name}"
                ]);
            } else {
                FinancialTransaction::createFromCommission($commission);
            }
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao processar pagamento de comissão: ' . $e->getMessage(), [
                'commission_id' => $commission->id,
                'exception' => $e
            ]);
            return false;
        }
    }
    
    /**
     * Busca comissões por filtros.
     *
     * @param array $filters
     * @return Collection
     */
    public function searchCommissions(array $filters = []): Collection
    {
        $query = CommissionEntry::with(['instructor', 'monthlyPayment.student']);
        
        if (isset($filters['instructor_id'])) {
            $query->where('instructor_id', $filters['instructor_id']);
        }
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('created_at', [$filters['start_date'], $filters['end_date']]);
        }
        
        if (isset($filters['month']) && isset($filters['year'])) {
            $startDate = Carbon::createFromDate($filters['year'], $filters['month'], 1)->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        return $query->orderBy('created_at', 'desc')->get();
    }
    
    /**
     * Gera relatório de comissões por período.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function generateCommissionReport(Carbon $startDate, Carbon $endDate): array
    {
        $commissions = CommissionEntry::with(['instructor', 'monthlyPayment.student'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
            
        $totalPending = $commissions->where('status', 'pending')->sum('commission_amount');
        $totalPaid = $commissions->where('status', 'paid')->sum('commission_amount');
        
        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_commissions' => $commissions->count(),
                'total_pending' => $totalPending,
                'total_paid' => $totalPaid,
                'total_amount' => $commissions->sum('commission_amount'),
            ],
            'by_status' => [
                'pending' => $commissions->where('status', 'pending')->count(),
                'paid' => $commissions->where('status', 'paid')->count(),
            ],
            'by_instructor' => $commissions->groupBy('instructor_id')->map(function ($instructorCommissions) {
                $instructor = $instructorCommissions->first()->instructor;
                return [
                    'instructor' => $instructor->name,
                    'total_commissions' => $instructorCommissions->count(),
                    'total_amount' => $instructorCommissions->sum('commission_amount'),
                    'paid_amount' => $instructorCommissions->where('status', 'paid')->sum('commission_amount'),
                    'pending_amount' => $instructorCommissions->where('status', 'pending')->sum('commission_amount'),
                ];
            })->values(),
            'commissions' => $commissions,
        ];
    }
    
    /**
     * Calcula comissões para todos os pagamentos confirmados em um período.
     *
     * @param Carbon|null $startDate
     * @param Carbon|null $endDate
     * @return array
     */
    public function calculatePendingCommissions(?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = MonthlyPayment::with(['student.instructor'])
            ->where('status', 'paid')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('commission_entries')
                    ->whereColumn('commission_entries.monthly_payment_id', 'monthly_payments.id');
            });
            
        if ($startDate && $endDate) {
            $query->whereBetween('paid_at', [$startDate, $endDate]);
        }
        
        $payments = $query->get();
        $processed = 0;
        $failed = 0;
        $commissions = collect();
        
        foreach ($payments as $payment) {
            $commission = $this->calculateCommission($payment);
            if ($commission) {
                $processed++;
                $commissions->push($commission);
            } else {
                $failed++;
            }
        }
        
        return [
            'processed' => $processed,
            'failed' => $failed,
            'total' => $payments->count(),
            'commissions' => $commissions,
        ];
    }
    
    /**
     * Processa pagamento em lote de comissões.
     *
     * @param array $commissionIds
     * @return array
     */
    public function processBatchPayment(array $commissionIds): array
    {
        $processed = 0;
        $failed = 0;
        
        $commissions = CommissionEntry::whereIn('id', $commissionIds)
            ->where('status', 'pending')
            ->get();
            
        foreach ($commissions as $commission) {
            $result = $this->processCommissionPayment($commission);
            if ($result) {
                $processed++;
            } else {
                $failed++;
            }
        }
        
        return [
            'processed' => $processed,
            'failed' => $failed,
            'total' => count($commissionIds),
        ];
    }
    
    /**
     * Obtém estatísticas de comissões para dashboard.
     *
     * @param int|null $instructorId
     * @return array
     */
    public function getDashboardStats(?int $instructorId = null): array
    {
        $query = CommissionEntry::query();
        
        if ($instructorId) {
            $query->where('instructor_id', $instructorId);
        }
        
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        $currentMonthCommissions = (clone $query)
            ->whereBetween('created_at', [$currentMonth, $currentMonth->copy()->endOfMonth()])
            ->get();
            
        $lastMonthCommissions = (clone $query)
            ->whereBetween('created_at', [$lastMonth, $lastMonth->copy()->endOfMonth()])
            ->get();
            
        $pendingCommissions = (clone $query)->where('status', 'pending')->get();
        
        return [
            'current_month' => [
                'total' => $currentMonthCommissions->sum('commission_amount'),
                'count' => $currentMonthCommissions->count(),
            ],
            'last_month' => [
                'total' => $lastMonthCommissions->sum('commission_amount'),
                'count' => $lastMonthCommissions->count(),
            ],
            'pending' => [
                'total' => $pendingCommissions->sum('commission_amount'),
                'count' => $pendingCommissions->count(),
            ],
            'comparison' => [
                'percentage' => $this->calculatePercentageChange(
                    $lastMonthCommissions->sum('commission_amount'),
                    $currentMonthCommissions->sum('commission_amount')
                ),
            ],
        ];
    }
    
    /**
     * Calcula a variação percentual entre dois valores.
     *
     * @param float $oldValue
     * @param float $newValue
     * @return float
     */
    private function calculatePercentageChange(float $oldValue, float $newValue): float
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }
        
        return round((($newValue - $oldValue) / $oldValue) * 100, 2);
    }
}