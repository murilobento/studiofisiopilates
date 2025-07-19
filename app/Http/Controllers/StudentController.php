<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\Student;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Student::with(['plan:id,description,price', 'instructor:id,name']);

        // Se for instrutor, mostrar apenas seus alunos
        if ($user->role === UserRole::INSTRUCTOR) {
            $query->where('instructor_id', $user->id);
        }

        // Filtros opcionais
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cpf', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $students = $query->select('id', 'name', 'email', 'phone', 'plan_id', 'custom_price', 'status', 'cpf', 'city', 'instructor_id', 'birth_date')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'status']),
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

    public function store(StoreStudentRequest $request)
    {
        $validated = $request->validated();

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

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $validated = $request->validated();

        // Se for instrutor, não permite alterar o instructor_id
        if (Auth::user()->role === UserRole::INSTRUCTOR) {
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
