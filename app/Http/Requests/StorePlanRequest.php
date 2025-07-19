<?php

namespace App\Http\Requests;

use App\Models\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StorePlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('create', Plan::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'frequency' => 'required|integer|min:1|max:30',
            'price' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'description.required' => 'A descrição do plano é obrigatória.',
            'frequency.required' => 'A frequência do plano é obrigatória.',
            'frequency.min' => 'A frequência deve ser pelo menos 1 aula por semana.',
            'frequency.max' => 'A frequência não pode exceder 30 aulas por semana.',
            'price.required' => 'O preço do plano é obrigatório.',
            'price.min' => 'O preço deve ser maior ou igual a zero.',
        ];
    }
}
