<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        $userRole = $user->role;

        // Se não foi especificado nenhum role, apenas verificar se está autenticado
        if (empty($roles)) {
            return $next($request);
        }

        // Converter strings para enums para comparação
        $allowedRoles = array_map(fn($role) => UserRole::from($role), $roles);

        // Verificar se o usuário tem pelo menos um dos roles necessários
        if (!in_array($userRole, $allowedRoles)) {
            abort(403, 'Acesso negado. Você não tem permissão para acessar esta área.');
        }

        return $next($request);
    }
} 