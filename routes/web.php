<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::resource('plans', \App\Http\Controllers\PlanController::class)->middleware(['auth', 'verified', 'active', 'role:admin']);
Route::resource('students', \App\Http\Controllers\StudentController::class)->middleware(['auth', 'verified', 'active']);

// Classes routes
Route::middleware(['auth', 'verified', 'active', 'role:admin,instructor'])->group(function () {
    Route::resource('classes', \App\Http\Controllers\ClassController::class);
    Route::resource('recurring-classes', \App\Http\Controllers\RecurringClassController::class);
    Route::get('calendar', [\App\Http\Controllers\ClassController::class, 'calendar'])->name('classes.calendar');
    Route::post('classes/{class}/students', [\App\Http\Controllers\ClassController::class, 'addStudent'])->name('classes.add-student');
    Route::delete('classes/{class}/students', [\App\Http\Controllers\ClassController::class, 'removeStudent'])->name('classes.remove-student');
});

// Users routes - apenas para admins
Route::middleware(['auth', 'verified', 'active', 'role:admin'])->group(function () {
    Route::resource('users', \App\Http\Controllers\UserController::class);
    Route::patch('users/{user}/toggle-status', [\App\Http\Controllers\UserController::class, 'toggleStatus'])->name('users.toggle-status');
});

Route::get('/buscar-cep/{cep}', function ($cep) {
    $viaCepService = new \App\Services\ViaCepService();
    $endereco = $viaCepService->buscarCep($cep);
    
    return response()->json($endereco);
})->middleware(['auth', 'verified', 'active']);
