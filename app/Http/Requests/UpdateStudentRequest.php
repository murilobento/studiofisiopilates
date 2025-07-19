<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Traits\NormalizesDates;

class UpdateStudentRequest extends FormRequest
{
    use NormalizesDates;

    /** @var array<int,string> */
    protected array $dateFields = ['birth_date'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::user()->can('update', $this->route('student'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');
        
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:students,email,' . $student->id,
            'phone' => 'nullable|string|max:20',
            'plan_id' => 'required|exists:plans,id',
            'custom_price' => 'nullable|numeric',
            'status' => 'required|in:ativo,inativo',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'neighborhood' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:10',
            'gender' => 'nullable|in:masculino,feminino,outro',
            'cpf' => 'nullable|string|max:14|unique:students,cpf,' . $student->id,
            'birth_date' => 'nullable|date',
            'medical_conditions' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'pilates_goals' => 'nullable|string',
            'physical_activity_history' => 'nullable|string',
            'general_notes' => 'nullable|string',
        ];

        // Admin pode escolher instrutor
        if (Auth::user()->role === UserRole::ADMIN) {
            $rules['instructor_id'] = 'nullable|exists:users,id';
        }

        return $rules;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->normalizeDates();
    }
}
