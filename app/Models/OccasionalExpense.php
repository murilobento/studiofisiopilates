<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class OccasionalExpense extends Model
{
    use HasFactory;

    /**
     * Os atributos que são atribuíveis em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'amount',
        'category',
        'expense_date',
        'receipt_path',
        'notes',
        'created_by',
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
    ];

    /**
     * Regras de validação para o modelo.
     *
     * @return array<string, mixed>
     */
    public static function validationRules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'expense_date' => 'required|date|before_or_equal:today',
            'receipt' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Obtém o usuário que criou a despesa ocasional.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    /**
     * Armazena o comprovante da despesa.
     *
     * @param UploadedFile $file
     * @return string|null
     */
    public function storeReceipt(UploadedFile $file): ?string
    {
        // Define o caminho de armazenamento
        $path = 'receipts/' . date('Y/m');
        
        // Gera um nome único para o arquivo
        $filename = uniqid() . '_' . $file->getClientOriginalName();
        
        // Armazena o arquivo
        $filePath = $file->storeAs($path, $filename, 'private');
        
        if ($filePath) {
            // Se já existir um comprovante, exclui o anterior
            if ($this->receipt_path) {
                Storage::disk('private')->delete($this->receipt_path);
            }
            
            // Atualiza o caminho do comprovante
            $this->receipt_path = $filePath;
            $this->save();
            
            return $filePath;
        }
        
        return null;
    }

    /**
     * Obtém a URL para download do comprovante.
     *
     * @return string|null
     */
    public function getReceiptUrl(): ?string
    {
        if (!$this->receipt_path) {
            return null;
        }
        
        // Gera uma URL temporária para o arquivo
        return Storage::disk('private')->temporaryUrl(
            $this->receipt_path,
            now()->addMinutes(5)
        );
    }

    /**
     * Verifica se a despesa tem um comprovante.
     *
     * @return bool
     */
    public function hasReceipt(): bool
    {
        return !empty($this->receipt_path) && 
               Storage::disk('private')->exists($this->receipt_path);
    }

    /**
     * Remove o comprovante da despesa.
     *
     * @return bool
     */
    public function removeReceipt(): bool
    {
        if ($this->receipt_path) {
            if (Storage::disk('private')->delete($this->receipt_path)) {
                $this->receipt_path = null;
                return $this->save();
            }
        }
        
        return false;
    }
}
