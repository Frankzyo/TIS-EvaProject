<?php

use App\Http\Controllers\DocenteController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProyectosController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\DocenteAuthController;
use App\Http\Controllers\Auth\EstudianteAuthController;
use App\Http\Controllers\GrupoController;
use App\Http\Middleware\CheckAdmin;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RequerimientoController;
use App\Http\Controllers\EstudianteController;

// Ruta de login para cargar la aplicación React
Route::get('/login', function () {
    return view('welcome'); // Carga tu aplicación React
})->name('login');

// Rutas de autenticación para docentes
Route::prefix('docente')->group(function () {
    Route::post('/login', [DocenteAuthController::class, 'login']);
    Route::post('/logout', [DocenteAuthController::class, 'logout']);
    Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLinkEmail']);
});

// Rutas de autenticación para estudiantes
Route::prefix('estudiante')->group(function () {
    Route::post('/login', [EstudianteAuthController::class, 'login']);
    Route::post('/logout', [EstudianteAuthController::class, 'logout']);
    Route::post('/password/forgot', [PasswordResetController::class, 'sendResetLinkEmail']);
});

Route::middleware(['auth:estudiante'])->prefix('estudiante')->group(function () {
    Route::get('/proyecto-grupo', [EstudianteController::class, 'obtenerProyectoYGrupo']);
});

// Ruta para restablecer la contraseña
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Ruta para obtener el usuario logueado (para ambos roles)
Route::get('/api/usuario-logueado', [AuthController::class, 'getLoggedUser'])
    ->middleware('auth:docente,estudiante');

// Rutas de la API para proyectos (solo accesibles para docentes autenticados)
Route::prefix('api')->middleware(['auth:docente'])->group(function () {
    Route::get('/proyectos', [ProyectosController::class, 'index']);
    Route::post('/proyectos', [ProyectosController::class, 'store']);
    Route::put('/proyectos/{id}', [ProyectosController::class, 'update']);
    Route::delete('/proyectos/{id}', [ProyectosController::class, 'destroy']);
    Route::get('/proyectos/{id}', [ProyectosController::class, 'show']);
});
Route::prefix('api-docente')->middleware(['auth:docente'])->group(function () {
    Route::get('/proyecto/{id}', [DocenteController::class, 'show']);
});

Route::prefix('api')->middleware(['auth:docente'])->group(function () {
    Route::get('/proyectos/{projectId}/grupos', [GrupoController::class, 'index']);
    Route::post('/grupos', [GrupoController::class, 'store']);
    Route::put('/grupos/{id}', [GrupoController::class, 'update']);
    Route::delete('/grupos/{id}', [GrupoController::class, 'destroy']);
});

Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/proyectos/{projectId}/requerimientos', [RequerimientoController::class, 'index']);
    Route::post('/requerimientos', [RequerimientoController::class, 'store']);
    Route::put('/requerimientos/{id}', [RequerimientoController::class, 'update']); // Ruta de actualización correcta
    Route::delete('/requerimientos/{id}', [RequerimientoController::class, 'destroy']);
    Route::get('/grupos/{id}', [GrupoController::class, 'show']);
});

Route::prefix('api')->middleware(['auth:docente'])->group(function () {
    Route::post('/estudiantes', [EstudianteController::class, 'store']);
    Route::get('/estudiantes', [EstudianteController::class, 'index']);
    Route::delete('/estudiantes/{id}', [EstudianteController::class, 'destroy']);
});

// Rutas para actualizar perfil y cambiar contraseña, protegidas por autenticación de docente y estudiante
Route::middleware('auth:docente,estudiante')->group(function () {
    Route::post('/api/usuario-logueado/update', [AuthController::class, 'updateProfile']);
    Route::post('/api/usuario-logueado/change-password', [AuthController::class, 'changePassword']);
});

// Rutas de administración protegidas por autenticación de docente y verificación de administrador
Route::middleware(['auth:docente', CheckAdmin::class])->prefix('api')->group(function () {
    Route::get('/pending-users', [DocenteAuthController::class, 'getPendingUsers']);
    Route::post('/approve-user/{id}', [DocenteAuthController::class, 'approveUser']);
    Route::post('/assign-admin/{id}', [DocenteAuthController::class, 'assignAdmin']);
    Route::get('/all-users', [DocenteAuthController::class, 'getAllUsers']);
});

Route::post('/api/requerimientos/crear-para-grupo', [RequerimientoController::class, 'crearParaGrupo']);
Route::prefix('api')->middleware(['auth:estudiante'])->group(function () {
    Route::delete('/requerimientos/estudiante/{id}', [RequerimientoController::class, 'destroyByStudent']);
    Route::put('/requerimientos/estudiante/{id}', [RequerimientoController::class, 'actualizarParaEstudiante']);
});

// Ruta para el registro de usuarios (accesible para ambos roles)
Route::post('/api/register', [AuthController::class, 'register']);

// Ruta de prueba para verificar funcionamiento del backend
Route::get('/test', function () {
    return response()->json(['message' => 'Ruta de prueba funcionando']);
});

// Ruta comodín para manejar todas las rutas frontend con React
Route::get('/{any}', function () {
    return view('welcome');  // Carga la vista de React
})->where('any', '.*');

// Ruta de prueba para la vista de correo electrónico
Route::get('/test-email-view', function () {
    return view('emails.test');
});
