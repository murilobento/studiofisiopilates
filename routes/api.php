<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/classes', [\App\Http\Controllers\Api\ClassController::class, 'index']);
});

// Rota temporária para teste sem autenticação
Route::get('/test-classes', [\App\Http\Controllers\Api\ClassController::class, 'index']); 