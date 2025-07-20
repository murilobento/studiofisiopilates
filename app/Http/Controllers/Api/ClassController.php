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
            // Usar a cor do instrutor como base, mas ajustar opacidade baseada no status
            $instructorColor = $class->instructor->calendar_color ?? '#3b82f6';
            $eventColors = $this->getEventColors($class->status->value, $instructorColor);
            
            return [
                'id' => $class->id,
                'title' => $class->title,
                'start' => $class->start_time->toISOString(),
                'end' => $class->end_time->toISOString(),
                'backgroundColor' => $eventColors['background'],
                'borderColor' => $eventColors['border'],
                'textColor' => $eventColors['text'],
                'extendedProps' => [
                    'instructor' => $class->instructor->name,
                    'instructor_id' => $class->instructor_id,
                    'instructor_color' => $instructorColor,
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
     * Check for instructor time conflicts.
     */
    public function checkConflict(Request $request)
    {
        $request->validate([
            'instructor_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'exclude_class_id' => 'nullable|exists:classes,id',
        ]);

        $startTime = Carbon::parse($request->start_time);
        $endTime = Carbon::parse($request->end_time);
        $instructorId = $request->instructor_id;
        $excludeClassId = $request->exclude_class_id;

        // Buscar aulas conflitantes
        $conflictingClass = ClassModel::with('instructor')
            ->where('instructor_id', $instructorId)
            ->where('status', 'scheduled')
            ->where(function ($q) use ($startTime, $endTime) {
                // Duas aulas se sobrepõem se:
                // - O início da nova aula é antes do fim da aula existente E
                // - O fim da nova aula é depois do início da aula existente
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })
            ->when($excludeClassId, function ($q) use ($excludeClassId) {
                $q->where('id', '!=', $excludeClassId);
            })
            ->first();

        if ($conflictingClass) {
            return response()->json([
                'hasConflict' => true,
                'existingClass' => [
                    'id' => $conflictingClass->id,
                    'title' => $conflictingClass->title,
                    'start_time' => $conflictingClass->start_time->toISOString(),
                    'end_time' => $conflictingClass->end_time->toISOString(),
                    'instructor' => $conflictingClass->instructor->name,
                ],
            ]);
        }

        return response()->json(['hasConflict' => false]);
    }

    /**
     * Get event colors based on status and instructor color.
     */
    private function getEventColors(string $status, string $instructorColor): array
    {
        // Converter hex para RGB para manipular opacidade
        $hex = ltrim($instructorColor, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));

        return match($status) {
            'scheduled' => [
                'background' => $instructorColor,
                'border' => $instructorColor,
                'text' => '#ffffff'
            ],
            'completed' => [
                'background' => "rgba($r, $g, $b, 0.3)",
                'border' => $instructorColor,
                'text' => $instructorColor
            ],
            'cancelled' => [
                'background' => "rgba($r, $g, $b, 0.1)",
                'border' => "rgba($r, $g, $b, 0.3)",
                'text' => "rgba($r, $g, $b, 0.6)"
            ],
            default => [
                'background' => '#6b7280',
                'border' => '#6b7280',
                'text' => '#ffffff'
            ]
        };
    }

    /**
     * Get event color based on status (legacy method).
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