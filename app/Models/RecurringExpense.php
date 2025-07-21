<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringExpense extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'amount',
        'type',
        'category',
        'due_day',
        'is_active',
        'created_by',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'due_day' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Regras de validação para o modelo.
     *
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'nullable|numeric|min:0',
            'type' => 'required|in:fixed,variable',
            'category' => 'required|string|max:255',
            'due_day' => 'required|integer|min:1|max:31',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Regras específicas para despesas de valor fixo.
     *
     * @return array<string, mixed>
     */
    public static function fixedExpenseRules(): array
    {
        return [
            'amount' => 'required|numeric|min:0',
        ];
    }

    /**
     * Obtém o usuário que criou a despesa recorrente.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Escopo para despesas ativas.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Escopo para despesas com vencimento próximo.
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Número de dias para considerar como próximo
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDueSoon($query, int $days = 5)
    {
        $currentDay = now()->day;
        $endDay = $currentDay + $days;
        
        return $query->where('is_active', true)
            ->where(function ($q) use ($currentDay, $endDay) {
                // Verifica se o dia de vencimento está dentro do intervalo
                $q->whereBetween('due_day', [$currentDay, $endDay]);
                
                // Trata o caso de virada de mês
                if ($endDay > 31) {
                    $q->orWhere('due_day', '<=', $endDay - 31);
                }
            });
    }

    /**
     * Verifica se a despesa é de valor fixo.
     *
     * @return bool
     */
    public function isFixed(): bool
    {
        return $this->type === 'fixed';
    }

    /**
     * Verifica se a despesa é de valor variável.
     *
     * @return bool
     */
    public function isVariable(): bool
    {
        return $this->type === 'variable';
    }
}
