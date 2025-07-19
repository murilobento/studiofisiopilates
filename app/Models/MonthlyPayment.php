<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class MonthlyPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'plan_id',
        'instructor_id',
        'amount',
        'original_amount',
        'discount',
        'late_fee',
        'interest',
        'due_date',
        'reference_month',
        'paid_at',
        'grace_period_until',
        'status',
        'payment_method',
        'notes',
        'receipt_number',
        'is_automatic',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'interest' => 'decimal:2',
        'due_date' => 'date',
        'reference_month' => 'date',
        'paid_at' => 'datetime',
        'grace_period_until' => 'date',
        'is_automatic' => 'boolean',
    ];
    
    protected $appends = [
        'formatted_reference_month',
    ];

    // Relacionamentos
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }

    public function scopeCurrentMonth($query)
    {
        return $query->whereMonth('reference_month', now()->month)
                    ->whereYear('reference_month', now()->year);
    }

    public function scopeByMonth($query, $month, $year = null)
    {
        $year = $year ?? now()->year;
        return $query->whereMonth('reference_month', $month)
                    ->whereYear('reference_month', $year);
    }

    public function scopeByInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeDueToday($query)
    {
        return $query->where('due_date', today());
    }

    public function scopeDueSoon($query, $days = 7)
    {
        return $query->where('due_date', '<=', today()->addDays($days))
                    ->where('due_date', '>=', today());
    }

    // Accessors
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pendente',
            'paid' => 'Pago',
            'overdue' => 'Em Atraso',
            'cancelled' => 'Cancelado',
            default => 'Desconhecido'
        };
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => 'Dinheiro',
            'credit_card' => 'Cartão de Crédito',
            'debit_card' => 'Cartão de Débito',
            'pix' => 'PIX',
            'transfer' => 'Transferência',
            'bank_transfer' => 'Transferência Bancária',
            'check' => 'Cheque',
            default => 'Não informado'
        };
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'pending' && $this->due_date < today();
    }

    public function getIsInGracePeriodAttribute(): bool
    {
        return $this->grace_period_until && today() <= $this->grace_period_until;
    }

    public function getDaysLateAttribute(): int
    {
        if ($this->status === 'paid' || !$this->is_overdue) {
            return 0;
        }

        return (int) today()->diffInDays($this->due_date);
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->late_fee + $this->interest;
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'R$ ' . number_format($this->amount, 2, ',', '.');
    }

    public function getFormattedTotalAmountAttribute(): string
    {
        return 'R$ ' . number_format($this->total_amount, 2, ',', '.');
    }
    
    public function getFormattedReferenceMonthAttribute(): string
    {
        if (!$this->reference_month) {
            return '-';
        }
        
        $meses = [
            1 => 'Janeiro',
            2 => 'Fevereiro',
            3 => 'Março',
            4 => 'Abril',
            5 => 'Maio',
            6 => 'Junho',
            7 => 'Julho',
            8 => 'Agosto',
            9 => 'Setembro',
            10 => 'Outubro',
            11 => 'Novembro',
            12 => 'Dezembro'
        ];
        
        $mes = $meses[$this->reference_month->month];
        $ano = $this->reference_month->year;
        
        return "{$mes}/{$ano}";
    }

    // Métodos de negócio
    public function markAsPaid(string $paymentMethod, ?string $notes = null, ?string $receiptNumber = null): void
    {
        $this->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'paid_at' => now(),
            'notes' => $notes,
            'receipt_number' => $receiptNumber,
            'updated_by' => auth()->id(),
        ]);
    }

    public function markAsOverdue(): void
    {
        if ($this->status === 'pending' && $this->due_date < today()) {
            $this->update([
                'status' => 'overdue',
                'updated_by' => auth()->id(),
            ]);
        }
    }

    public function calculateLateFee(float $feePercentage = 2.0): float
    {
        if (!$this->is_overdue) {
            return 0;
        }

        return $this->original_amount * ($feePercentage / 100);
    }

    public function calculateInterest(float $dailyRate = 0.033): float
    {
        if (!$this->is_overdue) {
            return 0;
        }

        // Usar o valor explicitamente convertido para int para evitar avisos de conversão implícita
        $daysLate = (int) today()->diffInDays($this->due_date);
        return $this->original_amount * ($dailyRate / 100) * $daysLate;
    }

    public function applyLateFeeAndInterest(float $feePercentage = 2.0, float $dailyRate = 0.033): void
    {
        if ($this->is_overdue && $this->status !== 'paid') {
            $lateFee = $this->calculateLateFee($feePercentage);
            $interest = $this->calculateInterest($dailyRate);
            
            $this->update([
                'late_fee' => $lateFee,
                'interest' => $interest,
                'amount' => $this->original_amount + $lateFee + $interest,
                'updated_by' => auth()->id(),
            ]);
        }
    }

    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason ? "Cancelado: {$reason}" : 'Cancelado',
            'updated_by' => auth()->id(),
        ]);
    }
    
    /**
     * Desfaz um pagamento, retornando para o status pendente
     */
    public function undoPayment(string $reason = null): void
    {
        if ($this->status !== 'paid') {
            throw new \Exception('Apenas pagamentos com status "pago" podem ser desfeitos.');
        }
        
        $this->update([
            'status' => 'pending',
            'payment_method' => null,
            'paid_at' => null,
            'notes' => $reason ? "Pagamento desfeito: {$reason}" : 'Pagamento desfeito',
            'updated_by' => auth()->id(),
        ]);
    }
    
    /**
     * Estorna um cancelamento, retornando para o status pendente
     */
    public function undoCancel(string $reason = null): void
    {
        if ($this->status !== 'cancelled') {
            throw new \Exception('Apenas mensalidades com status "cancelado" podem ser estornadas.');
        }
        
        $this->update([
            'status' => 'pending',
            'payment_method' => null,
            'paid_at' => null,
            'notes' => $reason ? "Cancelamento estornado: {$reason}" : 'Cancelamento estornado',
            'updated_by' => auth()->id(),
        ]);
    }

    public function generateReceiptNumber(): string
    {
        $prefix = 'REC';
        $year = $this->reference_month->format('Y');
        $month = $this->reference_month->format('m');
        $sequence = str_pad($this->id, 6, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$year}{$month}-{$sequence}";
    }

    // Eventos do modelo
    protected static function booted(): void
    {
        static::creating(function (MonthlyPayment $payment) {
            $payment->created_by = auth()->id();
            $payment->updated_by = auth()->id();
        });

        static::updating(function (MonthlyPayment $payment) {
            $payment->updated_by = auth()->id();
        });

        static::created(function (MonthlyPayment $payment) {
            if (!$payment->receipt_number) {
                $payment->update(['receipt_number' => $payment->generateReceiptNumber()]);
            }
        });
    }
}
