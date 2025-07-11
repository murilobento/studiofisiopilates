<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrar dados dos instrutores para a tabela users
        $instructors = DB::table('instructors')->get();

        foreach ($instructors as $instructor) {
            // Verificar se já existe um usuário com esse email
            $existingUser = DB::table('users')->where('email', $instructor->email)->first();
            
            if (!$existingUser) {
                DB::table('users')->insert([
                    'name' => $instructor->name,
                    'email' => $instructor->email,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password123'), // Senha padrão
                    'role' => 'instructor',
                    'cpf' => $instructor->cpf,
                    'phone' => $instructor->phone,
                    'commission_rate' => $instructor->commission ?? 0.00,
                    'is_active' => $instructor->status === 'ativo',
                    'created_at' => $instructor->created_at,
                    'updated_at' => $instructor->updated_at,
                ]);
            } else {
                // Atualizar usuário existente para role instructor
                DB::table('users')->where('email', $instructor->email)->update([
                    'role' => 'instructor',
                    'cpf' => $instructor->cpf,
                    'phone' => $instructor->phone,
                    'commission_rate' => $instructor->commission ?? 0.00,
                    'is_active' => $instructor->status === 'ativo',
                ]);
            }
        }

        // Garantir que existe pelo menos um admin
        $adminExists = DB::table('users')->where('role', 'admin')->exists();
        if (!$adminExists) {
            // Verificar se existe o usuário com ID 1 para torná-lo admin
            $firstUser = DB::table('users')->first();
            if ($firstUser) {
                DB::table('users')->where('id', $firstUser->id)->update(['role' => 'admin']);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remover usuários que foram criados a partir de instrutores
        DB::table('users')->where('role', 'instructor')->delete();
        
        // Resetar role de admin para usuários existentes
        DB::table('users')->update(['role' => 'admin']);
    }
}; 