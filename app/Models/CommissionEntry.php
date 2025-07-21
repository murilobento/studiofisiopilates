<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionEntry extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'instructor_id',
        'monthly_payment_id',
        'base_amount',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Regras de validação para o modelo.
     *
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'instructor_id' => 'required|exists:users,id',
            'monthly_payment_id' => 'required|exists:monthly_payments,id',
            'base_amount' => 'required|numeric|min:0',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'commission_amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,paid',
            'paid_at' => 'nullable|date',
        ];
    }

    /**
     * Obtém o instrutor associado à comissão.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Obtém o pagamento mensal associado à comissão.
     */
    public function monthlyPayment(): BelongsTo
    {
        return $this->belongsTo(MonthlyPayment::class);
    }

    /**
     * Escopo para comissões pendentes.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Escopo para comissões pagas.
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Calcula o valor da comissão com base no valor base e na taxa.
     *
     * @param float $baseAmount
     * @param float $commissionRate
     * @return float
     */
    public static function calculateCommissionAmount(float $baseAmount, float $commissionRate): float
    {
        return round($baseAmount * ($commissionRate / 100), 2);
    }

    /**
     * Cria uma nova entrada de comissão a partir de um pagamento mensal.
     *
     * @param MonthlyPayment $payment
     * @return self|null
     */
    public static function createFromPayment(MonthlyPayment $payment): ?self
    {
        // Verifica se o pagamento tem um instrutor associado
        $student = $payment->student;
        if (!$student || !$student->instructor_id) {
            return null;
        }

        // Obtém o instrutor e sua taxa de comissão
        $instructor = User::find($student->instructor_id);
        if (!$instructor) {
            return null;
        }

        // Assume uma taxa de comissão padrão se não estiver definida
        // Idealmente, isso deveria vir de um campo no modelo User
        $commissionRate = $instructor->commission_rate ?? 30;

        // Calcula o valor da comissão
        $baseAmount = $payment->amount;
        $commissionAmount = self::calculateCommissionAmount($baseAmount, $commissionRate);

        // Cria a entrada de comissão
        return self::create([
            'instructor_id' => $instructor->id,
            'monthly_payment_id' => $payment->id,
            'base_amount' => $baseAmount,
            'commission_rate' => $commissionRate,
            'commission_amount' => $commissionAmount,
            'status' => 'pending',
        ]);
    }

    /**
     * Marca a comissão como paga.
     *
     * @return bool
     */
    public function markAsPaid(): bool
    {
        $this->status = 'paid';
        $this->paid_at = now();
        return $this->save();
    }
}
