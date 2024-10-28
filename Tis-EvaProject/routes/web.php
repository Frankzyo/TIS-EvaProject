<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProyectosController;
use App\Http\Controllers\AuthController;

// Ruta ficticia de login para evitar error de redirección
Route::get('/login', function () {
    return view('welcome'); // Carga tu aplicación React
})->name('login');

// Rutas de autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/api/usuario-logueado', [AuthController::class, 'getLoggedUser']);

// Rutas de la API para proyectos, con autenticación para docentes
Route::prefix('api')->middleware(['auth:docente'])->group(function () {
    Route::get('/proyectos', [ProyectosController::class, 'index']);
    Route::post('/proyectos', [ProyectosController::class, 'store']);
    Route::put('/proyectos/{id}', [ProyectosController::class, 'update']);
    Route::delete('/proyectos/{id}', [ProyectosController::class, 'destroy']);
});

Route::post('/api/usuario-logueado/update', [AuthController::class, 'updateProfile'])
    ->middleware('auth:docente,estudiante');

Route::post('/api/usuario-logueado/change-password', [AuthController::class, 'changePassword'])
    ->middleware('auth:docente,estudiante');

// Ruta de prueba para verificar funcionamiento del backend
Route::get('/test', function () {
    return 'Ruta de prueba funcionando';
});

// Ruta de prueba para verificar el controlador de proyectos
Route::get('/test-controller', [ProyectosController::class, 'index']);

// Ruta comodín para manejar todas las rutas frontend con React
Route::get('/{any}', function () {
    return view('welcome');  // Carga la vista de React
})->where('any', '.*');
