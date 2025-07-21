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
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense', 'commission']);
            $table->string('category');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('transaction_date');
            $table->unsignedBigInteger('reference_id')->nullable(); // ID da origem (payment, expense, etc)
            $table->string('reference_type')->nullable(); // Tipo da origem (model class)
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
