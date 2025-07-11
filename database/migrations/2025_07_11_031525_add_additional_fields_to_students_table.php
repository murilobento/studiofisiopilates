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
        Schema::table('students', function (Blueprint $table) {
            // Endereço Completo
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            
            // Gênero
            $table->enum('gender', ['masculino', 'feminino', 'outro'])->nullable();
            
            // CPF
            $table->string('cpf')->nullable()->unique();
            
            // Informações de Saúde e Histórico
            $table->text('medical_conditions')->nullable();
            $table->text('medications')->nullable();
            $table->text('allergies')->nullable();
            $table->text('pilates_goals')->nullable();
            $table->text('physical_activity_history')->nullable();
            $table->text('general_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'street',
                'number', 
                'neighborhood',
                'city',
                'state',
                'zip_code',
                'gender',
                'cpf',
                'medical_conditions',
                'medications',
                'allergies',
                'pilates_goals',
                'physical_activity_history',
                'general_notes'
            ]);
        });
    }
};
