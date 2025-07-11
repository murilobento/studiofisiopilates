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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'instructor'])->default('admin')->after('email');
            $table->string('cpf', 14)->nullable()->unique()->after('role');
            $table->string('phone', 15)->nullable()->after('cpf');
            $table->decimal('commission_rate', 5, 2)->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('commission_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'cpf', 'phone', 'commission_rate', 'is_active']);
        });
    }
};
