<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\MonthlyPayment;
use App\Models\RecurringExpense;
use App\Models\OccasionalExpense;
use App\Models\CommissionEntry;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FinancialReportExport;

class FinancialService
{
    protected $commissionService;
    protected $expenseService;
    
    /**
     * Construtor do serviço financeiro.
     *
     * @param CommissionService $commissionService
     * @param ExpenseService $expenseService
     */
    public function __construct(CommissionService $commissionService, ExpenseService $expenseService)
    {
        $this->commissionService = $commissionService;
        $this->expenseService = $expenseService;
    }
    
    /**
     * Registra uma transação financeira a partir de um pagamento.
     *
     * @param MonthlyPayment $payment
     * @return FinancialTransaction|null
     */
    public function recordPaymentTransaction(MonthlyPayment $payment): ?FinancialTransaction
    {
        try {
            // Verifica se já existe uma transação para este pagamento
            $existingTransaction = FinancialTransaction::where('reference_id', $payment->id)
                ->where('reference_type', get_class($payment))
                ->first();
                
            if ($existingTransaction) {
                return $existingTransaction;
            }
            
            // Verifica se o pagamento está confirmado
            if ($payment->status !== 'paid') {
                return null;
            }
            
            // Cria a transação
            $transaction = FinancialTransaction::createFromPayment($payment);
            
            // Calcula a comissão automaticamente
            $this->commissionService->calculateCommission($payment);
            
            return $transaction;
        } catch (\Exception $e) {
            Log::error('Erro ao registrar transação de pagamento: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'exception' => $e
            ]);
            return null;
        }
    }
    
    /**
     * Gera um relatório financeiro consolidado para um período específico.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function generateFinancialReport(Carbon $startDate, Carbon $endDate): array
    {
        // Busca todas as transações no período
        $transactions = FinancialTransaction::whereBetween('transaction_date', [$startDate, $endDate])
            ->with('creator')
            ->get();
            
        // Agrupa por tipo
        $incomeTransactions = $transactions->where('type', 'income');
        $expenseTransactions = $transactions->where('type', 'expense');
        $commissionTransactions = $transactions->where('type', 'commission');
        
        // Calcula totais
        $totalIncome = $incomeTransactions->sum('amount');
        $totalExpenses = $expenseTransactions->sum('amount');
        $totalCommissions = $commissionTransactions->sum('amount');
        
        // Calcula lucro
        $profit = $totalIncome - $totalExpenses - $totalCommissions;
        $profitMargin = $totalIncome > 0 ? ($profit / $totalIncome) * 100 : 0;
        
        // Agrupa por categoria
        $incomeByCategory = $this->groupTransactionsByCategory($incomeTransactions);
        $expensesByCategory = $this->groupTransactionsByCategory($expenseTransactions);
        
        // Agrupa por mês para análise de tendência
        $monthlyData = $this->groupTransactionsByMonth($transactions, $startDate, $endDate);
        
        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'total_commissions' => $totalCommissions,
                'profit' => $profit,
                'profit_margin' => round($profitMargin, 2),
            ],
            'by_type' => [
                'income' => [
                    'total' => $totalIncome,
                    'count' => $incomeTransactions->count(),
                    'by_category' => $incomeByCategory,
                ],
                'expenses' => [
                    'total' => $totalExpenses,
                    'count' => $expenseTransactions->count(),
                    'by_category' => $expensesByCategory,
                ],
                'commissions' => [
                    'total' => $totalCommissions,
                    'count' => $commissionTransactions->count(),
                ],
            ],
            'monthly_trend' => $monthlyData,
            'transactions' => $transactions,
        ];
    }
    
    /**
     * Agrupa transações por categoria.
     *
     * @param Collection $transactions
     * @return Collection
     */
    private function groupTransactionsByCategory(Collection $transactions): Collection
    {
        return $transactions->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'category' => $category,
                    'total' => $items->sum('amount'),
                    'count' => $items->count(),
                    'percentage' => round(($items->sum('amount') / $items->sum('amount')) * 100, 2),
                ];
            })
            ->values();
    }
    
    /**
     * Agrupa transações por mês.
     *
     * @param Collection $transactions
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    private function groupTransactionsByMonth(Collection $transactions, Carbon $startDate, Carbon $endDate): array
    {
        $result = [];
        $currentDate = $startDate->copy()->startOfMonth();
        
        while ($currentDate <= $endDate) {
            $monthKey = $currentDate->format('Y-m');
            $monthTransactions = $transactions->filter(function ($transaction) use ($currentDate) {
                return $transaction->transaction_date->format('Y-m') === $currentDate->format('Y-m');
            });
            
            $income = $monthTransactions->where('type', 'income')->sum('amount');
            $expenses = $monthTransactions->where('type', 'expense')->sum('amount');
            $commissions = $monthTransactions->where('type', 'commission')->sum('amount');
            $profit = $income - $expenses - $commissions;
            
            $result[] = [
                'month' => $currentDate->format('m/Y'),
                'income' => $income,
                'expenses' => $expenses,
                'commissions' => $commissions,
                'profit' => $profit,
            ];
            
            $currentDate->addMonth();
        }
        
        return $result;
    }
    
    /**
     * Exporta relatório financeiro para PDF.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return string
     */
    public function exportReportToPdf(Carbon $startDate, Carbon $endDate): string
    {
        $report = $this->generateFinancialReport($startDate, $endDate);
        
        // Aqui você implementaria a geração do PDF usando uma biblioteca como DomPDF
        // Por exemplo:
        // $pdf = PDF::loadView('reports.financial', ['report' => $report]);
        // return $pdf->download('relatorio_financeiro_' . $startDate->format('Y-m-d') . '_' . $endDate->format('Y-m-d') . '.pdf');
        
        // Como é apenas um exemplo, retornamos uma string
        return 'PDF gerado com sucesso';
    }
    
    /**
     * Exporta relatório financeiro para Excel.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return string
     */
    public function exportReportToExcel(Carbon $startDate, Carbon $endDate): string
    {
        $report = $this->generateFinancialReport($startDate, $endDate);
        
        // Aqui você implementaria a exportação para Excel usando uma biblioteca como Maatwebsite\Excel
        // Por exemplo:
        // return Excel::download(new FinancialReportExport($report), 'relatorio_financeiro_' . $startDate->format('Y-m-d') . '_' . $endDate->format('Y-m-d') . '.xlsx');
        
        // Como é apenas um exemplo, retornamos uma string
        return 'Excel gerado com sucesso';
    }
    
    /**
     * Obtém dados para o dashboard financeiro.
     *
     * @return array
     */
    public function getDashboardData(): array
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Dados do mês atual
        $currentMonthData = $this->getMonthlyData($currentMonth);
        
        // Dados do mês anterior
        $lastMonthData = $this->getMonthlyData($lastMonth);
        
        // Calcula variações percentuais
        $incomeChange = $this->calculatePercentageChange($lastMonthData['income'], $currentMonthData['income']);
        $expenseChange = $this->calculatePercentageChange($lastMonthData['expenses'], $currentMonthData['expenses']);
        $profitChange = $this->calculatePercentageChange($lastMonthData['profit'], $currentMonthData['profit']);
        
        // Busca despesas com vencimento próximo
        $upcomingExpenses = $this->expenseService->checkUpcomingExpenses(7);
        
        // Busca comissões pendentes
        $pendingCommissions = CommissionEntry::pending()->with('instructor')->get();
        
        return [
            'current_month' => [
                'income' => $currentMonthData['income'],
                'expenses' => $currentMonthData['expenses'],
                'commissions' => $currentMonthData['commissions'],
                'profit' => $currentMonthData['profit'],
                'profit_margin' => $currentMonthData['profit_margin'],
            ],
            'last_month' => [
                'income' => $lastMonthData['income'],
                'expenses' => $lastMonthData['expenses'],
                'commissions' => $lastMonthData['commissions'],
                'profit' => $lastMonthData['profit'],
                'profit_margin' => $lastMonthData['profit_margin'],
            ],
            'changes' => [
                'income' => $incomeChange,
                'expenses' => $expenseChange,
                'profit' => $profitChange,
            ],
            'upcoming_expenses' => $upcomingExpenses->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'name' => $expense->name,
                    'amount' => $expense->amount,
                    'due_day' => $expense->due_day,
                    'category' => $expense->category,
                ];
            }),
            'pending_commissions' => $pendingCommissions->map(function ($commission) {
                return [
                    'id' => $commission->id,
                    'instructor' => $commission->instructor->name,
                    'amount' => $commission->commission_amount,
                    'created_at' => $commission->created_at->format('d/m/Y'),
                ];
            }),
        ];
    }
    
    /**
     * Obtém dados financeiros para um mês específico.
     *
     * @param Carbon $month
     * @return array
     */
    private function getMonthlyData(Carbon $month): array
    {
        $endOfMonth = $month->copy()->endOfMonth();
        
        $transactions = FinancialTransaction::whereBetween('transaction_date', [$month, $endOfMonth])->get();
        
        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');
        $commissions = $transactions->where('type', 'commission')->sum('amount');
        $profit = $income - $expenses - $commissions;
        $profitMargin = $income > 0 ? ($profit / $income) * 100 : 0;
        
        return [
            'income' => $income,
            'expenses' => $expenses,
            'commissions' => $commissions,
            'profit' => $profit,
            'profit_margin' => round($profitMargin, 2),
        ];
    }
    
    /**
     * Calcula indicadores financeiros.
     *
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function calculateFinancialIndicators(Carbon $startDate, Carbon $endDate): array
    {
        $report = $this->generateFinancialReport($startDate, $endDate);
        
        $totalIncome = $report['summary']['total_income'];
        $totalExpenses = $report['summary']['total_expenses'];
        $totalCommissions = $report['summary']['total_commissions'];
        $profit = $report['summary']['profit'];
        
        // Calcula indicadores
        $profitMargin = $totalIncome > 0 ? ($profit / $totalIncome) * 100 : 0;
        $expenseRatio = $totalIncome > 0 ? (($totalExpenses + $totalCommissions) / $totalIncome) * 100 : 0;
        $commissionRatio = $totalIncome > 0 ? ($totalCommissions / $totalIncome) * 100 : 0;
        
        // Calcula média diária
        $daysDiff = $startDate->diffInDays($endDate) + 1;
        $averageDailyIncome = $daysDiff > 0 ? $totalIncome / $daysDiff : 0;
        $averageDailyExpense = $daysDiff > 0 ? $totalExpenses / $daysDiff : 0;
        $averageDailyProfit = $daysDiff > 0 ? $profit / $daysDiff : 0;
        
        return [
            'profit_margin' => round($profitMargin, 2),
            'expense_ratio' => round($expenseRatio, 2),
            'commission_ratio' => round($commissionRatio, 2),
            'average_daily_income' => round($averageDailyIncome, 2),
            'average_daily_expense' => round($averageDailyExpense, 2),
            'average_daily_profit' => round($averageDailyProfit, 2),
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