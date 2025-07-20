<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth', 'verified'])->group(function () {
    Route::get('/classes', [\App\Http\Controllers\Api\ClassController::class, 'index']);
    Route::post('/classes/check-conflict', [\App\Http\Controllers\Api\ClassController::class, 'checkConflict']);
});

// Rota temporária para teste sem autenticação
Route::get('/test-classes', [\App\Http\Controllers\Api\ClassController::class, 'index']); 