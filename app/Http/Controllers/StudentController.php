<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $query = Student::with(['plan', 'instructor']);

        // Se for instrutor, mostrar apenas seus alunos
        if ($user->role === UserRole::INSTRUCTOR) {
            $query->where('instructor_id', $user->id);
        }

        $students = $query->select('id', 'name', 'email', 'phone', 'plan_id', 'custom_price', 'status', 'cpf', 'city', 'instructor_id')
            ->get();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'can' => [
                'chooseInstructor' => $user->role === UserRole::ADMIN,
            ],
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $plans = Plan::select('id', 'description', 'price')->get();
        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Students/Create', [
            'plans' => $plans,
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->role === UserRole::ADMIN,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validationRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:students',
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
            'cpf' => 'nullable|string|max:14|unique:students',
            'medical_conditions' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'pilates_goals' => 'nullable|string',
            'physical_activity_history' => 'nullable|string',
            'general_notes' => 'nullable|string',
        ];

        // Admin pode escolher instrutor, instrutor fica fixo no próprio
        if ($user->role === UserRole::ADMIN) {
            $validationRules['instructor_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($validationRules);

        // Se for instrutor, forçar o instructor_id para o próprio usuário
        if ($user->role === UserRole::INSTRUCTOR) {
            $validated['instructor_id'] = $user->id;
        }

        Student::create($validated);

        return redirect()->route('students.index')->with('success', 'Aluno cadastrado com sucesso!');
    }

    public function edit(Student $student)
    {
        $user = Auth::user();
        
        // Se for instrutor, só pode editar seus próprios alunos
        if ($user->role === UserRole::INSTRUCTOR && $student->instructor_id !== $user->id) {
            abort(403, 'Você só pode editar seus próprios alunos.');
        }

        $plans = Plan::select('id', 'description', 'price')->get();
        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Students/Edit', [
            'student' => $student->load(['plan', 'instructor']),
            'plans' => $plans,
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->role === UserRole::ADMIN,
            ],
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $user = Auth::user();
        
        // Se for instrutor, só pode editar seus próprios alunos
        if ($user->role === UserRole::INSTRUCTOR && $student->instructor_id !== $user->id) {
            abort(403, 'Você só pode editar seus próprios alunos.');
        }

        $validationRules = [
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
            'medical_conditions' => 'nullable|string',
            'medications' => 'nullable|string',
            'allergies' => 'nullable|string',
            'pilates_goals' => 'nullable|string',
            'physical_activity_history' => 'nullable|string',
            'general_notes' => 'nullable|string',
        ];

        // Admin pode alterar instrutor, instrutor não pode
        if ($user->role === UserRole::ADMIN) {
            $validationRules['instructor_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($validationRules);

        // Se for instrutor, não permite alterar o instructor_id
        if ($user->role === UserRole::INSTRUCTOR) {
            unset($validated['instructor_id']);
        }

        $student->update($validated);

        return redirect()->route('students.index')->with('success', 'Aluno atualizado com sucesso!');
    }

    public function destroy(Student $student)
    {
        $user = Auth::user();
        
        // Se for instrutor, só pode excluir seus próprios alunos
        if ($user->role === UserRole::INSTRUCTOR && $student->instructor_id !== $user->id) {
            abort(403, 'Você só pode excluir seus próprios alunos.');
        }

        $student->delete();

        return redirect()->route('students.index')->with('success', 'Aluno excluído com sucesso!');
    }
}
