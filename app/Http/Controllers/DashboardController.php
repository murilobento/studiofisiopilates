<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Plan;
use App\Models\MonthlyPayment;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isInstructor = $user->role === UserRole::INSTRUCTOR;
        
        // Cache dashboard metrics for 5 minutes (diferente para cada tipo de usuário)
        $cacheKey = $isInstructor ? "dashboard_stats_instructor_{$user->id}" : 'dashboard_stats_admin';
        
        $stats = Cache::remember($cacheKey, 300, function () use ($isInstructor, $user) {
            if ($isInstructor) {
                // Instrutor vê apenas estatísticas dos seus próprios alunos
                $totalStudents = Student::where('status', 'ativo')
                    ->where('instructor_id', $user->id)
                    ->count();

                // Receita baseada em pagamentos reais, não custom_price
                $totalRevenue = MonthlyPayment::where('instructor_id', $user->id)
                    ->where('status', 'paid')
                    ->sum('amount');

                return [
                    'totalStudents' => $totalStudents,
                    'totalPlans' => Plan::count(), // Planos são visíveis para todos
                    'totalRevenue' => (float) $totalRevenue,
                ];
            } else {
                // Admin vê tudo
                $totalStudents = Student::where('status', 'ativo')->count();
                
                // Receita baseada em pagamentos reais para admin também
                $totalRevenue = MonthlyPayment::where('status', 'paid')->sum('amount');

                return [
                    'totalStudents' => $totalStudents,
                    'totalPlans' => Plan::count(),
                    'totalRevenue' => (float) $totalRevenue,
                ];
            }
        });
        
        // Alunos por plano (filtrado por instrutor se necessário)
        $studentsByPlanQuery = Student::select('plans.description', DB::raw('count(*) as total'))
            ->join('plans', 'students.plan_id', '=', 'plans.id')
            ->where('students.status', 'ativo');
            
        if ($isInstructor) {
            $studentsByPlanQuery->where('students.instructor_id', $user->id);
        }
        
        $studentsByPlan = $studentsByPlanQuery
            ->groupBy('plans.id', 'plans.description')
            ->orderBy('total', 'desc')
            ->get();

        // Se não há alunos, criar dados vazios para evitar erros no frontend
        if ($studentsByPlan->isEmpty()) {
            $studentsByPlan = collect([
                ['description' => 'Nenhum aluno ativo', 'total' => 0]
            ]);
        }

        // Alunos por cidade (filtrado por instrutor se necessário)
        $studentsByCityQuery = Student::select('city', DB::raw('count(*) as total'))
            ->where('status', 'ativo')
            ->whereNotNull('city');
            
        if ($isInstructor) {
            $studentsByCityQuery->where('instructor_id', $user->id);
        }
        
        $studentsByCity = $studentsByCityQuery
            ->groupBy('city')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        // Se não há cidades, criar dados vazios
        if ($studentsByCity->isEmpty()) {
            $studentsByCity = collect([
                ['city' => 'Nenhuma cidade cadastrada', 'total' => 0]
            ]);
        }

        // Alunos por mês (últimos 6 meses, filtrado por instrutor se necessário)
        $studentsByMonthQuery = Student::select(
                DB::raw('strftime("%Y-%m", created_at) as month'),
                DB::raw('count(*) as total')
            )
            ->where('status', 'ativo')
            ->where('created_at', '>=', now()->subMonths(6))
            ->whereNotNull('created_at');
            
        if ($isInstructor) {
            $studentsByMonthQuery->where('instructor_id', $user->id);
        }
        
        $studentsByMonth = $studentsByMonthQuery
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Se não há dados por mês, criar dados vazios
        if ($studentsByMonth->isEmpty()) {
            $studentsByMonth = collect([
                ['month' => now()->format('Y-m'), 'total' => 0]
            ]);
        }

        // Planos mais populares (filtrado por instrutor se necessário)
        $popularPlansQuery = Plan::select('plans.description', 'plans.price', DB::raw('count(students.id) as student_count'))
            ->leftJoin('students', function($join) use ($isInstructor, $user) {
                $join->on('plans.id', '=', 'students.plan_id')
                     ->where('students.status', '=', 'ativo');
                if ($isInstructor) {
                    $join->where('students.instructor_id', '=', $user->id);
                }
            });
            
        $popularPlans = $popularPlansQuery
            ->groupBy('plans.id', 'plans.description', 'plans.price')
            ->orderBy('student_count', 'desc')
            ->get();

        // Se não há planos, criar dados vazios
        if ($popularPlans->isEmpty()) {
            $popularPlans = collect([
                ['description' => 'Nenhum plano cadastrado', 'price' => 0, 'student_count' => 0]
            ]);
        }

        // Alunos recentes (últimos 5, filtrado por instrutor se necessário)
        $recentStudentsQuery = Student::with('plan')
            ->where('status', 'ativo')
            ->orderBy('created_at', 'desc')
            ->limit(5);

        if ($isInstructor) {
            $recentStudentsQuery->where('instructor_id', $user->id);
        }

        $recentStudents = $recentStudentsQuery->get(['id', 'name', 'email', 'plan_id', 'created_at']);

        // Se não há alunos recentes, criar dados vazios
        if ($recentStudents->isEmpty()) {
            $recentStudents = collect([
                [
                    'id' => 0,
                    'name' => 'Nenhum aluno ativo',
                    'email' => '',
                    'created_at' => now(),
                    'plan' => ['description' => '']
                ]
            ]);
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalStudents' => $stats['totalStudents'],
                'totalPlans' => $stats['totalPlans'],
                'totalRevenue' => $stats['totalRevenue'],
                'averageRevenuePerStudent' => $stats['totalStudents'] > 0 ? round($stats['totalRevenue'] / $stats['totalStudents'], 2) : 0,
            ],
            'studentsByPlan' => $studentsByPlan,
            'studentsByCity' => $studentsByCity,
            'studentsByMonth' => $studentsByMonth,
            'popularPlans' => $popularPlans,
            'recentStudents' => $recentStudents,
        ]);
    }
} 