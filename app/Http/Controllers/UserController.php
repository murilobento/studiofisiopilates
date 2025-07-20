<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct()
    {
        // Verificação de admin será feita em cada método
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::whereIn('role', [UserRole::INSTRUCTOR, UserRole::ADMIN])
            ->select('id', 'name', 'email', 'commission_rate', 'is_active', 'created_at', 'role', 'calendar_color')
            ->withCount(['students', 'classes']);

        // Filtro de busca por nome ou email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        // Filtro por role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filtro por status
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $instructors = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $instructors,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:15',
            'cpf' => 'nullable|string|max:14|unique:users',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'boolean',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'cpf' => $request->cpf,
            'commission_rate' => $request->commission_rate,
            'password' => Hash::make($request->password),
            'role' => UserRole::INSTRUCTOR,
            'is_active' => $request->boolean('is_active', true),
            'email_verified_at' => now(), // Auto-verificar email para usuários criados pelo admin
        ]);

        return redirect()->route('users.index')
            ->with('success', 'Usuário criado com sucesso!');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        $user->load(['students.plan', 'classes' => function ($query) {
            $query->orderBy('start_time', 'desc')->limit(10);
        }]);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        return Inertia::render('Users/Edit', [
            'user' => $user->only([
                'id', 'name', 'email', 'phone', 'cpf', 'commission_rate', 'is_active', 'role'
            ]),
            'roles' => UserRole::toArray(),
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:15',
            'cpf' => 'nullable|string|max:14|unique:users,cpf,' . $user->id,
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'boolean',
            'role' => 'required|in:admin,instructor',
        ]);

        $data = $request->only(['name', 'email', 'phone', 'cpf', 'commission_rate', 'is_active', 'role']);

        // Só atualizar senha se fornecida
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', 'Usuário atualizado com sucesso!');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        // Impedir que o usuário exclua a própria conta
        if ($user->id === Auth::id()) {
            return back()->withErrors([
                'delete' => 'Você não pode excluir sua própria conta.'
            ]);
        }

        // Verificar se tem alunos ou aulas associadas
        if ($user->students()->count() > 0 || $user->classes()->count() > 0) {
            return back()->withErrors([
                'delete' => 'Não é possível excluir este usuário pois ele possui alunos ou aulas associadas. Desative-o ao invés de excluir.'
            ]);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuário excluído com sucesso!');
    }

    /**
     * Toggle user active status.
     */
    public function toggleStatus(User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'ativado' : 'desativado';

        return back()->with('success', "Usuário {$status} com sucesso!");
    }

    /**
     * Update user calendar color.
     */
    public function updateCalendarColor(Request $request, User $user)
    {
        // Verificar se é realmente um instrutor ou admin
        if (!in_array($user->role, [UserRole::INSTRUCTOR, UserRole::ADMIN])) {
            abort(404);
        }

        $request->validate([
            'calendar_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $user->update([
            'calendar_color' => $request->calendar_color
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cor do calendário atualizada com sucesso!'
        ]);
    }
} 