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
    Route::patch('users/{user}/calendar-color', [\App\Http\Controllers\UserController::class, 'updateCalendarColor'])->name('users.update-calendar-color');
});

// Payments routes
Route::middleware(['auth', 'verified', 'active', 'role:admin,instructor'])->group(function () {
    Route::get('payments/generate', [\App\Http\Controllers\PaymentController::class, 'generateForm'])->name('payments.generate');
    Route::post('payments/generate/check', [\App\Http\Controllers\PaymentController::class, 'checkGeneration'])->name('payments.generate.check');
    Route::post('payments/generate', [\App\Http\Controllers\PaymentController::class, 'generate'])->name('payments.generate.store');
    Route::resource('payments', \App\Http\Controllers\PaymentController::class);
    Route::post('payments/{payment}/process', [\App\Http\Controllers\PaymentController::class, 'processPayment'])->name('payments.process');
    Route::post('payments/{payment}/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('payments.cancel');
    Route::post('payments/{payment}/undo', [\App\Http\Controllers\PaymentController::class, 'undoPayment'])->name('payments.undo');
    Route::post('payments/{payment}/undo-cancel', [\App\Http\Controllers\PaymentController::class, 'undoCancel'])->name('payments.undo-cancel');
    Route::get('payments/report', [\App\Http\Controllers\PaymentController::class, 'report'])->name('payments.report');
});

Route::get('/buscar-cep/{cep}', function ($cep) {
    $viaCepService = new \App\Services\ViaCepService();
    $endereco = $viaCepService->buscarCep($cep);
    
    return response()->json($endereco);
})->middleware(['auth', 'verified', 'active', 'throttle:10,1']);
