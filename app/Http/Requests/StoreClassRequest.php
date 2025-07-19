<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Services\ClassEnrollmentService;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Traits\NormalizesDates;

class StoreClassRequest extends FormRequest
{
    use NormalizesDates;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check() && (
            Auth::user()->role === UserRole::ADMIN || 
            Auth::user()->role === UserRole::INSTRUCTOR
        );
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'max_students' => 'nullable|integer|min:1|max:10',
            'status' => 'nullable|string|in:scheduled,completed,cancelled',
        ];

        // Admin pode escolher instrutor, instrutor fica fixo no próprio
        if (Auth::user()->role === UserRole::ADMIN) {
            $rules['instructor_id'] = 'required|exists:users,id';
        }

        return $rules;
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'O título da aula é obrigatório.',
            'title.max' => 'O título não pode ter mais de 255 caracteres.',
            'start_time.required' => 'O horário de início é obrigatório.',
            'start_time.after' => 'A aula deve ser agendada para o futuro.',
            'end_time.required' => 'O horário de término é obrigatório.',
            'end_time.after' => 'O horário de término deve ser posterior ao horário de início.',
            'instructor_id.required' => 'O instrutor é obrigatório.',
            'instructor_id.exists' => 'Instrutor inválido.',
            'max_students.min' => 'Deve ter pelo menos 1 aluno por aula.',
            'max_students.max' => 'Máximo de 10 alunos por aula.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $startTime = Carbon::parse($this->start_time);
            $endTime = Carbon::parse($this->end_time);

            // Validar horários de funcionamento usando o service
            $enrollmentService = app(ClassEnrollmentService::class);
            $timeErrors = $enrollmentService->validateClassTime($startTime, $endTime);

            foreach ($timeErrors as $error) {
                $validator->errors()->add('start_time', $error);
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Normalizar datas/horários antes de qualquer outra lógica
        $this->dateTimeFields = ['start_time', 'end_time'];
        $this->normalizeDates();

        // Se for instrutor, definir o instructor_id automaticamente
        if (Auth::user()->role === UserRole::INSTRUCTOR) {
            $this->merge([
                'instructor_id' => Auth::id(),
            ]);
        }

        // Definir status padrão se não informado
        if (!$this->has('status')) {
            $this->merge([
                'status' => 'scheduled',
            ]);
        }

        // Definir max_students padrão se não informado
        if (!$this->has('max_students')) {
            $this->merge([
                'max_students' => 5,
            ]);
        }
    }
} 