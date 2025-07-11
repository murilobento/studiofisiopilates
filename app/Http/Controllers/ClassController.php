<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Models\ClassModel;
use App\Models\Student;
use App\Models\User;
use App\Services\ClassEnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ClassController extends Controller
{
    protected ClassEnrollmentService $enrollmentService;

    public function __construct(ClassEnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', ClassModel::class);

        $user = Auth::user();
        $query = ClassModel::with(['instructor', 'students']);

        // Se for instrutor, mostrar apenas suas aulas
        if ($user->role === UserRole::INSTRUCTOR) {
            $query->where('instructor_id', $user->id);
        }

        // Filtros
        if ($request->filled('instructor_id') && $user->role === UserRole::ADMIN) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $date = Carbon::parse($request->date);
            $query->whereDate('start_time', $date);
        }

        $classes = $query->orderBy('start_time', 'asc')->paginate(15);

        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'instructors' => $instructors,
            'filters' => $request->only(['instructor_id', 'status', 'date']),
            'can' => [
                'create' => Auth::user()->can('create', ClassModel::class),
                'chooseInstructor' => Auth::user()->can('chooseInstructor', ClassModel::class),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', ClassModel::class);

        $user = Auth::user();
        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Classes/Create', [
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->can('chooseInstructor', ClassModel::class),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClassRequest $request)
    {
        $this->authorize('create', ClassModel::class);

        $user = Auth::user();
        $validated = $request->validated();

        // Se for instrutor, força o instructor_id para o próprio usuário
        if ($user->role === UserRole::INSTRUCTOR) {
            $validated['instructor_id'] = $user->id;
        }

        // Validar conflitos de horário
        $startTime = Carbon::parse($validated['start_time']);
        $endTime = Carbon::parse($validated['end_time']);

        if ($this->enrollmentService->hasInstructorConflict(
            $validated['instructor_id'],
            $startTime,
            $endTime
        )) {
            return back()->withErrors([
                'start_time' => 'O instrutor já possui uma aula agendada neste horário.'
            ]);
        }

        ClassModel::create($validated);

        return redirect()->route('classes.index')
            ->with('success', 'Aula criada com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassModel $class)
    {
        $this->authorize('view', $class);

        $class->load(['instructor', 'students.plan']);

        $availableStudents = $this->enrollmentService->getAvailableStudentsForClass($class->id);

        return Inertia::render('Classes/Show', [
            'class' => $class,
            'availableStudents' => $availableStudents,
            'can' => [
                'update' => Auth::user()->can('update', $class),
                'delete' => Auth::user()->can('delete', $class),
                'manageStudents' => Auth::user()->can('manageStudents', $class),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ClassModel $class)
    {
        $this->authorize('update', $class);

        $user = Auth::user();
        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Classes/Edit', [
            'class' => $class,
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->can('chooseInstructor', ClassModel::class),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClassRequest $request, ClassModel $class)
    {
        $this->authorize('update', $class);

        $validated = $request->validated();

        // Se for instrutor, não permite alterar o instructor_id
        if (Auth::user()->role === UserRole::INSTRUCTOR) {
            unset($validated['instructor_id']);
        }

        // Validar conflitos de horário se mudou os horários
        if (isset($validated['start_time']) || isset($validated['end_time'])) {
            $startTime = Carbon::parse($validated['start_time'] ?? $class->start_time);
            $endTime = Carbon::parse($validated['end_time'] ?? $class->end_time);
            $instructorId = $validated['instructor_id'] ?? $class->instructor_id;

            if ($this->enrollmentService->hasInstructorConflict(
                $instructorId,
                $startTime,
                $endTime,
                $class->id
            )) {
                return back()->withErrors([
                    'start_time' => 'O instrutor já possui uma aula agendada neste horário.'
                ]);
            }
        }

        $class->update($validated);

        return redirect()->route('classes.index')
            ->with('success', 'Aula atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassModel $class)
    {
        $this->authorize('delete', $class);

        $class->delete();

        return redirect()->route('classes.index')
            ->with('success', 'Aula excluída com sucesso!');
    }

    /**
     * Add student to class.
     */
    public function addStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        if ($this->enrollmentService->enrollStudent($class->id, $request->student_id)) {
            return back()->with('success', 'Aluno adicionado à aula com sucesso!');
        }

        return back()->withErrors([
            'student_id' => 'Não foi possível adicionar o aluno à aula. Verifique se ele ainda pode se inscrever esta semana.',
        ]);
    }

    /**
     * Remove student from class.
     */
    public function removeStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $request->validate([
            'student_id' => 'required|exists:students,id',
        ]);

        if ($this->enrollmentService->removeStudent($class->id, $request->student_id)) {
            return back()->with('success', 'Aluno removido da aula com sucesso!');
        }

        return back()->withErrors([
            'student_id' => 'Não foi possível remover o aluno da aula.',
        ]);
    }

    /**
     * Calendar view.
     */
    public function calendar()
    {
        $this->authorize('viewAny', ClassModel::class);

        $user = Auth::user();
        $instructors = $user->role === UserRole::ADMIN 
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('Classes/Calendar', [
            'instructors' => $instructors,
            'can' => [
                'create' => Auth::user()->can('create', ClassModel::class),
                'chooseInstructor' => Auth::user()->can('chooseInstructor', ClassModel::class),
            ],
        ]);
    }
} 