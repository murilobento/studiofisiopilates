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
        Schema::create('monthly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('plans')->onDelete('cascade');
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            
            // Dados da mensalidade
            $table->decimal('amount', 10, 2); // Valor da mensalidade
            $table->decimal('original_amount', 10, 2); // Valor original (sem desconto/acréscimo)
            $table->decimal('discount', 10, 2)->default(0); // Desconto aplicado
            $table->decimal('late_fee', 10, 2)->default(0); // Multa por atraso
            $table->decimal('interest', 10, 2)->default(0); // Juros por atraso
            
            // Datas importantes
            $table->date('due_date'); // Data de vencimento
            $table->date('reference_month'); // Mês de referência (YYYY-MM-01)
            $table->datetime('paid_at')->nullable(); // Data/hora do pagamento
            $table->date('grace_period_until')->nullable(); // Período de carência
            
            // Status e método de pagamento
            $table->enum('status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check'])->nullable();
            
            // Observações e controle
            $table->text('notes')->nullable(); // Observações sobre o pagamento
            $table->string('receipt_number')->nullable(); // Número do recibo
            $table->boolean('is_automatic')->default(true); // Se foi gerada automaticamente
            
            // Auditoria
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            // Índices para performance
            $table->index(['student_id', 'reference_month']);
            $table->index(['status', 'due_date']);
            $table->index(['instructor_id', 'reference_month']);
            $table->index('reference_month');
            
            // Constraint única para evitar duplicatas
            $table->unique(['student_id', 'reference_month'], 'unique_student_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_payments');
    }
};
