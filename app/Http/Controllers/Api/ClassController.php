<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ClassController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin,instructor');
    }

    /**
     * Get classes for calendar view.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = ClassModel::with(['instructor', 'students']);

        // Se for instrutor, mostrar apenas suas aulas
        if ($user->role === UserRole::INSTRUCTOR) {
            $query->where('instructor_id', $user->id);
        }

        // Filtrar por período se fornecido
        if ($request->has('start') && $request->has('end')) {
            $start = Carbon::parse($request->start);
            $end = Carbon::parse($request->end);
            $query->whereBetween('start_time', [$start, $end]);
        }

        // Filtrar por instrutor se fornecido (apenas admin)
        if ($request->filled('instructor_id') && $user->role === UserRole::ADMIN) {
            $query->where('instructor_id', $request->instructor_id);
        }

        $classes = $query->get();

        // Transformar para formato do FullCalendar
        $events = $classes->map(function ($class) {
            return [
                'id' => $class->id,
                'title' => $class->title,
                'start' => $class->start_time->toISOString(),
                'end' => $class->end_time->toISOString(),
                'backgroundColor' => $this->getEventColor($class->status->value),
                'borderColor' => $this->getEventColor($class->status->value),
                'extendedProps' => [
                    'instructor' => $class->instructor->name,
                    'instructor_id' => $class->instructor_id,
                    'status' => $class->status->value,
                    'status_label' => $class->status->label(),
                    'enrolled_count' => $class->students->count(),
                    'max_students' => $class->max_students,
                    'has_space' => $class->hasSpace(),
                    // Lista dos nomes dos alunos para exibir no calendário
                    'students' => $class->students->pluck('name')->toArray(),
                ],
            ];
        });

        return response()->json($events);
    }

    /**
     * Get event color based on status.
     */
    private function getEventColor(string $status): string
    {
        return match($status) {
            'scheduled' => '#3b82f6', // blue
            'completed' => '#10b981', // green
            'cancelled' => '#ef4444', // red
            default => '#6b7280', // gray
        };
    }
} 