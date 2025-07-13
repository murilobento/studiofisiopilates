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
        Schema::create('recurring_classes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('instructor_id')->constrained('users');
            $table->unsignedTinyInteger('day_of_week'); // 1 = Monday, 2 = Tuesday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedTinyInteger('max_students')->default(10);
            $table->boolean('auto_replicate_students')->default(true);
            $table->boolean('is_active')->default(true);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_classes');
    }
};
