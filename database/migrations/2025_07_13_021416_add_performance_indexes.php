<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            // Índice composto para detecção de conflitos e consultas de agenda
            $table->index(['instructor_id', 'start_time'], 'classes_instructor_start_time_index');
            // Índices individuais para consultas frequentes
            $table->index('start_time', 'classes_start_time_index');
            $table->index('status', 'classes_status_index');
        });

        Schema::table('students', function (Blueprint $table) {
            // Índices para consultas frequentes
            $table->index('status', 'students_status_index');
            $table->index('plan_id', 'students_plan_id_index');
            $table->index('instructor_id', 'students_instructor_id_index');
        });

        Schema::table('recurring_classes', function (Blueprint $table) {
            // Índices para consultas de agenda e geração de aulas
            $table->index(['instructor_id', 'day_of_week'], 'recurring_classes_instructor_day_index');
            $table->index('is_active', 'recurring_classes_is_active_index');
        });

        Schema::table('class_student', function (Blueprint $table) {
            // Índice para consultas de matrícula por status (se necessário no futuro)
            if (Schema::hasColumn('class_student', 'status')) {
                $table->index('status', 'class_student_status_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex('classes_instructor_start_time_index');
            $table->dropIndex('classes_start_time_index');
            $table->dropIndex('classes_status_index');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_status_index');
            $table->dropIndex('students_plan_id_index');
            $table->dropIndex('students_instructor_id_index');
        });

        Schema::table('recurring_classes', function (Blueprint $table) {
            $table->dropIndex('recurring_classes_instructor_day_index');
            $table->dropIndex('recurring_classes_is_active_index');
        });

        Schema::table('class_student', function (Blueprint $table) {
            if (Schema::hasColumn('class_student', 'status')) {
                $table->dropIndex('class_student_status_index');
            }
        });
    }
};
