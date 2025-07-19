<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Http\Requests\Traits\NormalizesDates;
use App\Models\RecurringClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreRecurringClassRequest extends FormRequest
{
    use NormalizesDates;

    /** @var array<int,string> */
    protected array $dateFields = ['start_date', 'end_date'];

    public function authorize(): bool
    {
        return Auth::user()->can('create', RecurringClass::class);
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'day_of_week' => 'required|integer|between:1,7',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'max_students' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'auto_replicate_students' => 'required|boolean',
            'is_active' => 'required|boolean',
        ];

        if (Auth::user()->role === UserRole::ADMIN) {
            $rules['instructor_id'] = 'required|exists:users,id';
        }

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        // Normaliza datas (do trait)
        $this->normalizeDates();

        // Se for instrutor, definir instructor_id automaticamente
        if (Auth::user()->role === UserRole::INSTRUCTOR) {
            $this->merge([
                'instructor_id' => Auth::id(),
            ]);
        }
    }
} 