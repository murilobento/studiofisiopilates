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
        Schema::create('commission_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users');
            $table->foreignId('monthly_payment_id')->constrained('monthly_payments');
            $table->decimal('base_amount', 10, 2); // Valor base do pagamento
            $table->decimal('commission_rate', 5, 2); // Taxa aplicada (%)
            $table->decimal('commission_amount', 10, 2); // Valor da comissão
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_entries');
    }
};
