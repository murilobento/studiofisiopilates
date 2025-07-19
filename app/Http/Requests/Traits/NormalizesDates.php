<?php

namespace App\Http\Requests\Traits;

use Carbon\Carbon;

/**
 * Trait para normalizar campos de data / datetime antes da validação.
 *
 * Exemplo de uso:
 *   protected array $dateFields = ['birth_date'];
 *   protected array $dateTimeFields = ['start_time', 'end_time'];
 *   
 *   protected function prepareForValidation(): void
 *   {
 *       $this->normalizeDates();
 *       // ... outras lógicas ...
 *   }
 */
trait NormalizesDates
{
    // As classes que usam este trait podem definir os arrays $dateFields e $dateTimeFields.
    // Não declaramos aqui para evitar conflito de propriedade duplicada.

    /**
     * Normaliza os campos configurados.
     */
    protected function normalizeDates(): void
    {
        $dateFields = property_exists($this, 'dateFields') ? $this->dateFields : [];
        foreach ($dateFields as $field) {
            if ($this->filled($field)) {
                try {
                    $date = Carbon::parse($this->input($field));
                    $this->merge([
                        $field => $date->format('Y-m-d'),
                    ]);
                } catch (\Exception $e) {
                    // Mantém valor original caso o parse falhe para permitir que a validação aponte erro
                }
            }
        }

        $dateTimeFields = property_exists($this, 'dateTimeFields') ? $this->dateTimeFields : [];
        foreach ($dateTimeFields as $field) {
            if ($this->filled($field)) {
                try {
                    $date = Carbon::parse($this->input($field));
                    $this->merge([
                        $field => $date->format('Y-m-d H:i:s'),
                    ]);
                } catch (\Exception $e) {
                    // Mantém valor original para que a validação trate o erro
                }
            }
        }
    }
} 