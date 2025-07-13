<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'instructor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'max_students',
        'auto_replicate_students',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'max_students' => 'integer',
        'auto_replicate_students' => 'boolean',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the instructor that owns the recurring class.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * Get the class instances for the recurring class.
     */
    public function classInstances(): HasMany
    {
        return $this->hasMany(ClassModel::class, 'recurring_class_id');
    }
} 