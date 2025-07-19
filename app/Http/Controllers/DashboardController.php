<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Cache dashboard metrics for 5 minutes
        $stats = Cache::remember('dashboard_stats', 300, function () {
            return [
                'totalStudents' => Student::where('status', 'ativo')->count(),
                'totalPlans' => Plan::count(),
                'totalRevenue' => Student::where('status', 'ativo')->whereNotNull('custom_price')->sum('custom_price'),
            ];
        });
        
        // Alunos por plano (apenas ativos)
        $studentsByPlan = Student::select('plans.description', DB::raw('count(*) as total'))
            ->join('plans', 'students.plan_id', '=', 'plans.id')
            ->where('students.status', 'ativo')
            ->groupBy('plans.id', 'plans.description')
            ->orderBy('total', 'desc')
            ->get();

        // Se não há alunos, criar dados vazios para evitar erros no frontend
        if ($studentsByPlan->isEmpty()) {
            $studentsByPlan = collect([
                ['description' => 'Nenhum aluno ativo', 'total' => 0]
            ]);
        }

        // Alunos por cidade (apenas ativos)
        $studentsByCity = Student::select('city', DB::raw('count(*) as total'))
            ->where('status', 'ativo')
            ->whereNotNull('city')
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

        // Alunos por mês (últimos 6 meses, apenas ativos)
        $studentsByMonth = Student::select(
                DB::raw('strftime("%Y-%m", created_at) as month'),
                DB::raw('count(*) as total')
            )
            ->where('status', 'ativo')
            ->where('created_at', '>=', now()->subMonths(6))
            ->whereNotNull('created_at')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Se não há dados por mês, criar dados vazios
        if ($studentsByMonth->isEmpty()) {
            $studentsByMonth = collect([
                ['month' => now()->format('Y-m'), 'total' => 0]
            ]);
        }

        // Planos mais populares (apenas alunos ativos)
        $popularPlans = Plan::select('plans.description', 'plans.price', DB::raw('count(students.id) as student_count'))
            ->leftJoin('students', function($join) {
                $join->on('plans.id', '=', 'students.plan_id')
                     ->where('students.status', '=', 'ativo');
            })
            ->groupBy('plans.id', 'plans.description', 'plans.price')
            ->orderBy('student_count', 'desc')
            ->get();

        // Se não há planos, criar dados vazios
        if ($popularPlans->isEmpty()) {
            $popularPlans = collect([
                ['description' => 'Nenhum plano cadastrado', 'price' => 0, 'student_count' => 0]
            ]);
        }

        // Alunos recentes (últimos 5, apenas ativos)
        $recentStudents = Student::with('plan')
            ->where('status', 'ativo')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'plan_id', 'created_at']);

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