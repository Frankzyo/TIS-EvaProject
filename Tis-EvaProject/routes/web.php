<?php

use App\Http\Controllers\DocenteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProyectosController;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\CheckAdmin;

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
Route::prefix('api-docente')->middleware(['auth:docente'])->group(function () {
    Route::get('/proyecto/{id}', [DocenteController::class, 'show']);
});

// Rutas protegidas por autenticación de docente y estudiante para actualizar perfil y cambiar contraseña
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

// Rutas protegidas por middleware de administrador
Route::middleware(['auth:docente', CheckAdmin::class])->group(function () {
    Route::get('/ruta-admin', function () {
        return response()->json(['message' => 'Acceso concedido. Usuario es administrador.']);
    });
    // Otras rutas de administración aquí
});
Route::middleware(['auth:docente', CheckAdmin::class])->get('/api/pending-users', [AuthController::class, 'getPendingUsers']);
Route::middleware(['auth:docente', CheckAdmin::class])->post('/api/approve-user/{id}', [AuthController::class, 'approveUser']);

// Ruta para el registro de usuarios
Route::post('/api/register', [AuthController::class, 'register']);

// Ruta comodín para manejar todas las rutas frontend con React
Route::get('/{any}', function () {
    return view('welcome');  // Carga la vista de React
})->where('any', '.*');
