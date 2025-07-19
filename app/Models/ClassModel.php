<?php

namespace App\Models;

use App\Enums\ClassStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class ClassModel extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'instructor_id',
        'title',
        'start_time',
        'end_time',
        'max_students',
        'status',
        'recurring_class_id',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'status' => ClassStatus::class,
        ];
    }

    // Relationships
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the recurring class that owns the class instance.
     */
    public function recurringClass(): BelongsTo
    {
        return $this->belongsTo(RecurringClass::class, 'recurring_class_id');
    }

    /**
     * The students that belong to the class.
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_student', 'class_id', 'student_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeForInstructor($query, $instructorId)
    {
        return $query->where('instructor_id', $instructorId);
    }

    public function scopeThisWeek($query, ?Carbon $startOfWeek = null)
    {
        $start = $startOfWeek ?: Carbon::now()->startOfWeek();
        $end = $start->copy()->endOfWeek();
        
        return $query->whereBetween('start_time', [$start, $end]);
    }

    public function scopeByStatus($query, ClassStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', ClassStatus::SCHEDULED);
    }

    // Methods
    public function hasSpace(): bool
    {
        // Use the loaded relationship if available, otherwise query
        $studentsCount = $this->relationLoaded('students') 
            ? $this->students->count() 
            : $this->students()->count();
            
        return $studentsCount < $this->max_students;
    }

    public function canAddStudent(): bool
    {
        return $this->hasSpace() && $this->status === ClassStatus::SCHEDULED;
    }

    public function getDurationInMinutes(): int
    {
        return (int) $this->start_time->diffInMinutes($this->end_time);
    }

    public function getEnrolledStudentsCount(): int
    {
        return $this->students()->wherePivot('status', 'enrolled')->count();
    }

    public function isInThePast(): bool
    {
        return $this->start_time->isPast();
    }

    public function canBeModified(): bool
    {
        return !$this->isInThePast() && $this->status === ClassStatus::SCHEDULED;
    }
} 