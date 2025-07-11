<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Se o usuário está logado mas inativo, fazer logout
            if (!$user->is_active) {
                Auth::logout();
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Sua conta foi desativada. Entre em contato com o administrador.'
                    ], 401);
                }
                
                return redirect()->route('login')->withErrors([
                    'email' => 'Sua conta foi desativada. Entre em contato com o administrador.'
                ]);
            }
        }

        return $next($request);
    }
}
