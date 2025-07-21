<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'category',
        'description',
        'amount',
        'transaction_date',
        'reference_id',
        'reference_type',
        'created_by',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    /**
     * Regras de validação para o modelo.
     *
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'type' => 'required|in:income,expense,commission',
            'category' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'transaction_date' => 'required|date',
            'reference_id' => 'nullable|integer',
            'reference_type' => 'nullable|string|max:255',
        ];
    }

    /**
     * Obtém o usuário que criou a transação.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Obtém o modelo relacionado à transação (polimórfico).
     */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Escopo para transações de receita.
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Escopo para transações de despesa.
     */
    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    /**
     * Escopo para transações de comissão.
     */
    public function scopeCommission($query)
    {
        return $query->where('type', 'commission');
    }

    /**
     * Escopo para filtrar por categoria.
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Escopo para filtrar por período.
     */
    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Cria uma transação a partir de um pagamento mensal.
     *
     * @param MonthlyPayment $payment
     * @return self
     */
    public static function createFromPayment(MonthlyPayment $payment): self
    {
        return self::create([
            'type' => 'income',
            'category' => 'monthly_payment',
            'description' => "Pagamento mensal - {$payment->student->name}",
            'amount' => $payment->amount,
            'transaction_date' => $payment->payment_date ?? now(),
            'reference_id' => $payment->id,
            'reference_type' => get_class($payment),
            'created_by' => auth()->id() ?? 1,
        ]);
    }

    /**
     * Cria uma transação a partir de uma despesa recorrente.
     *
     * @param RecurringExpense $expense
     * @param float|null $amount Valor específico para despesas variáveis
     * @return self
     */
    public static function createFromRecurringExpense(RecurringExpense $expense, ?float $amount = null): self
    {
        return self::create([
            'type' => 'expense',
            'category' => $expense->category,
            'description' => $expense->name,
            'amount' => $amount ?? $expense->amount,
            'transaction_date' => now(),
            'reference_id' => $expense->id,
            'reference_type' => get_class($expense),
            'created_by' => auth()->id() ?? 1,
        ]);
    }

    /**
     * Cria uma transação a partir de uma despesa ocasional.
     *
     * @param OccasionalExpense $expense
     * @return self
     */
    public static function createFromOccasionalExpense(OccasionalExpense $expense): self
    {
        return self::create([
            'type' => 'expense',
            'category' => $expense->category,
            'description' => $expense->description,
            'amount' => $expense->amount,
            'transaction_date' => $expense->expense_date,
            'reference_id' => $expense->id,
            'reference_type' => get_class($expense),
            'created_by' => $expense->created_by,
        ]);
    }

    /**
     * Cria uma transação a partir de uma comissão.
     *
     * @param CommissionEntry $commission
     * @return self
     */
    public static function createFromCommission(CommissionEntry $commission): self
    {
        return self::create([
            'type' => 'commission',
            'category' => 'instructor_commission',
            'description' => "Comissão - {$commission->instructor->name}",
            'amount' => $commission->commission_amount,
            'transaction_date' => $commission->paid_at ?? now(),
            'reference_id' => $commission->id,
            'reference_type' => get_class($commission),
            'created_by' => auth()->id() ?? 1,
        ]);
    }

    /**
     * Calcula o saldo total para um período específico.
     *
     * @param string|null $startDate
     * @param string|null $endDate
     * @return float
     */
    public static function calculateBalance(?string $startDate = null, ?string $endDate = null): float
    {
        $query = self::query();
        
        if ($startDate && $endDate) {
            $query->inPeriod($startDate, $endDate);
        }
        
        $income = (clone $query)->income()->sum('amount');
        $expenses = (clone $query)->where('type', '!=', 'income')->sum('amount');
        
        return $income - $expenses;
    }
}
