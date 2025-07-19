<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\RecurringClass;
use App\Models\User;
use App\Services\RecurringClassService;
use App\Http\Requests\StoreRecurringClassRequest;
use App\Http\Requests\UpdateRecurringClassRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecurringClassController extends Controller
{
    protected RecurringClassService $recurringClassService;

    public function __construct(RecurringClassService $recurringClassService)
    {
        $this->recurringClassService = $recurringClassService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $query = RecurringClass::with('instructor');

        if ($user->role === UserRole::INSTRUCTOR) {
            $query->where('instructor_id', $user->id);
        }

        $recurringClasses = $query->orderBy('day_of_week')->orderBy('start_time')->get();

        return Inertia::render('RecurringClasses/Index', [
            'recurringClasses' => $recurringClasses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        // Apenas Admins podem escolher o instrutor.
        // Instrutores criam aulas para si mesmos.
        $instructors = $user->role === UserRole::ADMIN
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('RecurringClasses/Create', [
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->can('chooseInstructor', RecurringClass::class)
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRecurringClassRequest $request)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $recurringClass = RecurringClass::create($validated);
            
            // Gera automaticamente todas as recorrências
            $createdCount = $this->recurringClassService->generateRecurrences($recurringClass);
            
            session()->flash('success', "Horário fixo criado com sucesso! {$createdCount} aulas foram geradas automaticamente.");
        });

        return redirect()->route('recurring-classes.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(RecurringClass $recurringClass)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RecurringClass $recurringClass)
    {
        $this->authorize('update', $recurringClass);

        $user = Auth::user();
        
        $instructors = $user->role === UserRole::ADMIN
            ? User::canBeInstructors()->active()->get(['id', 'name'])
            : collect();

        return Inertia::render('RecurringClasses/Edit', [
            'recurringClass' => $recurringClass,
            'instructors' => $instructors,
            'can' => [
                'chooseInstructor' => $user->can('chooseInstructor', RecurringClass::class)
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRecurringClassRequest $request, RecurringClass $recurringClass)
    {
        $this->authorize('update', $recurringClass);

        $validated = $request->validated();

        DB::transaction(function () use ($recurringClass, $validated) {
            // Remove aulas futuras existentes
            $deletedCount = $this->recurringClassService->deleteRecurrences($recurringClass);
            
            // Atualiza o molde
            $recurringClass->update($validated);
            
            // Regenera as aulas
            $createdCount = $this->recurringClassService->generateRecurrences($recurringClass);
            
            session()->flash('success', "Horário fixo atualizado! {$deletedCount} aulas futuras foram removidas e {$createdCount} novas aulas foram geradas.");
        });

        return redirect()->route('recurring-classes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RecurringClass $recurringClass)
    {
        $this->authorize('delete', $recurringClass);

        DB::transaction(function () use ($recurringClass) {
            // Remove todas as aulas futuras vinculadas
            $deletedCount = $this->recurringClassService->deleteRecurrences($recurringClass);
            
            // Remove o molde
            $recurringClass->delete();
            
            session()->flash('success', "Horário fixo excluído com sucesso! {$deletedCount} aulas futuras foram removidas.");
        });

        return redirect()->route('recurring-classes.index');
    }
}
