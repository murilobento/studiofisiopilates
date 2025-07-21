<?php

namespace App\Services;

use App\Models\RecurringExpense;
use App\Models\OccasionalExpense;
use App\Models\FinancialTransaction;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;

class ExpenseService
{
    /**
     * Cria uma nova despesa recorrente.
     *
     * @param array $data
     * @return RecurringExpense
     */
    public function createRecurringExpense(array $data): RecurringExpense
    {
        try {
            DB::beginTransaction();
            
            // Adiciona o usuário atual como criador
            $data['created_by'] = auth()->id();
            
            // Cria a despesa recorrente
            $expense = RecurringExpense::create($data);
            
            // Se for uma despesa fixa, cria uma transação financeira
            if ($expense->isFixed() && $expense->is_active) {
                FinancialTransaction::createFromRecurringExpense($expense);
            }
            
            DB::commit();
            return $expense;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao criar despesa recorrente: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);
            throw $e;
        }
    }
    
    /**
     * Atualiza uma despesa recorrente existente.
     *
     * @param RecurringExpense $expense
     * @param array $data
     * @return RecurringExpense
     */
    public function updateRecurringExpense(RecurringExpense $expense, array $data): RecurringExpense
    {
        try {
            DB::beginTransaction();
            
            $oldType = $expense->type;
            $oldAmount = $expense->amount;
            $oldIsActive = $expense->is_active;
            
            // Atualiza a despesa
            $expense->update($data);
            
            // Verifica se houve mudança no tipo, valor ou status
            $typeChanged = $oldType !== $expense->type;
            $amountChanged = $oldAmount !== $expense->amount;
            $statusChanged = $oldIsActive !== $expense->is_active;
            
            // Se houve mudança relevante e a despesa é fixa e ativa, atualiza ou cria transação
            if (($typeChanged || $amountChanged || $statusChanged) && $expense->isFixed() && $expense->is_active) {
                // Busca transação existente
                $transaction = FinancialTransaction::where('reference_id', $expense->id)
                    ->where('reference_type', get_class($expense))
                    ->first();
                    
                if ($transaction) {
                    $transaction->update([
                        'amount' => $expense->amount,
                        'description' => $expense->name,
                    ]);
                } else {
                    FinancialTransaction::createFromRecurringExpense($expense);
                }
            }
            
            DB::commit();
            return $expense;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar despesa recorrente: ' . $e->getMessage(), [
                'expense_id' => $expense->id,
                'data' => $data,
                'exception' => $e
            ]);
            throw $e;
        }
    }
    
    /**
     * Registra um pagamento para uma despesa recorrente variável.
     *
     * @param RecurringExpense $expense
     * @param float $amount
     * @param Carbon|null $date
     * @return FinancialTransaction
     */
    public function registerRecurringExpensePayment(RecurringExpense $expense, float $amount, ?Carbon $date = null): FinancialTransaction
    {
        try {
            DB::beginTransaction();
            
            // Cria a transação financeira
            $transaction = FinancialTransaction::create([
                'type' => 'expense',
                'category' => $expense->category,
                'description' => $expense->name . ' - ' . ($date ? $date->format('m/Y') : now()->format('m/Y')),
                'amount' => $amount,
                'transaction_date' => $date ?? now(),
                'reference_id' => $expense->id,
                'reference_type' => get_class($expense),
                'created_by' => auth()->id(),
            ]);
            
            DB::commit();
            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao registrar pagamento de despesa recorrente: ' . $e->getMessage(), [
                'expense_id' => $expense->id,
                'amount' => $amount,
                'exception' => $e
            ]);
            throw $e;
        }
    }
    
    /**
     * Cria uma nova despesa ocasional.
     *
     * @param array $data
     * @param UploadedFile|null $receipt
     * @return OccasionalExpense
     */
    public function createOccasionalExpense(array $data, ?UploadedFile $receipt = null): OccasionalExpense
    {
        try {
            DB::beginTransaction();
            
            // Adiciona o usuário atual como criador
            $data['created_by'] = auth()->id();
            
            // Cria a despesa ocasional
            $expense = OccasionalExpense::create($data);
            
            // Se foi fornecido um comprovante, armazena-o
            if ($receipt) {
                $expense->storeReceipt($receipt);
            }
            
            // Cria a transação financeira
            FinancialTransaction::createFromOccasionalExpense($expense);
            
            DB::commit();
            return $expense;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao criar despesa ocasional: ' . $e->getMessage(), [
                'data' => $data,
                'exception' => $e
            ]);
            throw $e;
        }
    }
    
    /**
     * Atualiza uma despesa ocasional existente.
     *
     * @param OccasionalExpense $expense
     * @param array $data
     * @param UploadedFile|null $receipt
     * @return OccasionalExpense
     */
    public function updateOccasionalExpense(OccasionalExpense $expense, array $data, ?UploadedFile $receipt = null): OccasionalExpense
    {
        try {
            DB::beginTransaction();
            
            $oldAmount = $expense->amount;
            $oldDescription = $expense->description;
            $oldCategory = $expense->category;
            $oldDate = $expense->expense_date;
            
            // Atualiza a despesa
            $expense->update($data);
            
            // Se foi fornecido um novo comprovante, atualiza-o
            if ($receipt) {
                $expense->storeReceipt($receipt);
            }
            
            // Verifica se houve mudança relevante
            $amountChanged = $oldAmount !== $expense->amount;
            $descriptionChanged = $oldDescription !== $expense->description;
            $categoryChanged = $oldCategory !== $expense->category;
            $dateChanged = $oldDate !== $expense->expense_date;
            
            // Se houve mudança relevante, atualiza a transação
            if ($amountChanged || $descriptionChanged || $categoryChanged || $dateChanged) {
                $transaction = FinancialTransaction::where('reference_id', $expense->id)
                    ->where('reference_type', get_class($expense))
                    ->first();
                    
                if ($transaction) {
                    $transaction->update([
                        'amount' => $expense->amount,
                        'description' => $expense->description,
                        'category' => $expense->category,
                        'transaction_date' => $expense->expense_date,
                    ]);
                } else {
                    FinancialTransaction::createFromOccasionalExpense($expense);
                }
            }
            
            DB::commit();
            return $expense;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar despesa ocasional: ' . $e->getMessage(), [
                'expense_id' => $expense->id,
                'data' => $data,
                'exception' => $e
            ]);
            throw $e;
        }
    }
    
    /**
     * Exclui uma despesa ocasional.
     *
     * @param OccasionalExpense $expense
     * @return bool
     */
    public function deleteOccasionalExpense(OccasionalExpense $expense): bool
    {
        try {
            DB::beginTransaction();
            
            // Remove o comprovante, se existir
            if ($expense->hasReceipt()) {
                $expense->removeReceipt();
            }
            
            // Remove a transação financeira associada
            FinancialTransaction::where('reference_id', $expense->id)
                ->where('reference_type', get_class($expense))
                ->delete();
                
            // Remove a despesa
            $expense->delete();
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao excluir despesa ocasional: ' . $e->getMessage(), [
                'expense_id' => $expense->id,
                'exception' => $e
            ]);
            return false;
        }
    }
    
    /**
     * Busca despesas recorrentes por filtros.
     *
     * @param array $filters
     * @return Collection
     */
    public function searchRecurringExpenses(array $filters = []): Collection
    {
        $query = RecurringExpense::with('creator');
        
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }
        
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        if (isset($filters['due_day'])) {
            $query->where('due_day', $filters['due_day']);
        }
        
        return $query->orderBy('due_day')->get();
    }
    
    /**
     * Busca despesas ocasionais por filtros.
     *
     * @param array $filters
     * @return Collection
     */
    public function searchOccasionalExpenses(array $filters = []): Collection
    {
        $query = OccasionalExpense::with('creator');
        
        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('expense_date', [$filters['start_date'], $filters['end_date']]);
        }
        
        if (isset($filters['min_amount'])) {
            $query->where('amount', '>=', $filters['min_amount']);
        }
        
        if (isset($filters['max_amount'])) {
            $query->where('amount', '<=', $filters['max_amount']);
        }
        
        if (isset($filters['has_receipt'])) {
            if ($filters['has_receipt']) {
                $query->whereNotNull('receipt_path');
            } else {
                $query->whereNull('receipt_path');
            }
        }
        
        return $query->orderBy('expense_date', 'desc')->get();
    }
    
    /**
     * Verifica despesas recorrentes com vencimento próximo.
     *
     * @param int $days
     * @return Collection
     */
    public function checkUpcomingExpenses(int $days = 5): Collection
    {
        return RecurringExpense::active()->dueSoon($days)->get();
    }
    
    /**
     * Envia notificações para despesas com vencimento próximo.
     *
     * @param int $days
     * @return int
     */
    public function sendDueNotifications(int $days = 5): int
    {
        $expenses = $this->checkUpcomingExpenses($days);
        $count = 0;
        
        // Aqui você implementaria o envio de notificações
        // Por exemplo, usando o sistema de notificações do Laravel
        
        // foreach ($expenses as $expense) {
        //     $admin = User::where('role', 'admin')->first();
        //     if ($admin) {
        //         Notification::send($admin, new ExpenseDueNotification($expense));
        //         $count++;
        //     }
        // }
        
        return $count;
    }
    
    /**
     * Obtém estatísticas de despesas para dashboard.
     *
     * @return array
     */
    public function getDashboardStats(): array
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Despesas recorrentes
        $recurringExpenses = RecurringExpense::active()->get();
        $recurringFixedTotal = $recurringExpenses->where('type', 'fixed')->sum('amount');
        
        // Transações do mês atual
        $currentMonthTransactions = FinancialTransaction::whereBetween('transaction_date', [
            $currentMonth, $currentMonth->copy()->endOfMonth()
        ])->get();
        
        $currentMonthExpenses = $currentMonthTransactions->where('type', 'expense')->sum('amount');
        
        // Transações do mês anterior
        $lastMonthTransactions = FinancialTransaction::whereBetween('transaction_date', [
            $lastMonth, $lastMonth->copy()->endOfMonth()
        ])->get();
        
        $lastMonthExpenses = $lastMonthTransactions->where('type', 'expense')->sum('amount');
        
        // Despesas por categoria no mês atual
        $expensesByCategory = $currentMonthTransactions
            ->where('type', 'expense')
            ->groupBy('category')
            ->map(function ($items, $category) {
                return [
                    'category' => $category,
                    'amount' => $items->sum('amount'),
                    'count' => $items->count(),
                ];
            })
            ->values();
            
        // Próximas despesas a vencer
        $upcomingExpenses = $this->checkUpcomingExpenses(7);
        
        return [
            'current_month' => [
                'total' => $currentMonthExpenses,
                'fixed' => $recurringFixedTotal,
                'variable' => $currentMonthExpenses - $recurringFixedTotal,
            ],
            'last_month' => [
                'total' => $lastMonthExpenses,
            ],
            'comparison' => [
                'percentage' => $this->calculatePercentageChange($lastMonthExpenses, $currentMonthExpenses),
            ],
            'by_category' => $expensesByCategory,
            'upcoming' => $upcomingExpenses->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'name' => $expense->name,
                    'amount' => $expense->amount,
                    'due_day' => $expense->due_day,
                    'days_until_due' => $this->calculateDaysUntilDue($expense->due_day),
                ];
            }),
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
    
    /**
     * Calcula quantos dias faltam até o vencimento.
     *
     * @param int $dueDay
     * @return int
     */
    private function calculateDaysUntilDue(int $dueDay): int
    {
        $currentDay = now()->day;
        $lastDayOfMonth = now()->endOfMonth()->day;
        
        if ($dueDay < $currentDay) {
            // Vencimento será no próximo mês
            $daysLeftInMonth = $lastDayOfMonth - $currentDay;
            return $daysLeftInMonth + $dueDay;
        }
        
        return $dueDay - $currentDay;
    }
}