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
use App\Http\Controllers\HistoriaUsuarioController;
use App\Http\Controllers\FechaDefensaController;
use App\Http\Controllers\EtapaController;
use App\Http\Controllers\RubricaController;
use App\Http\Controllers\EvaluacionIndividualController;
use App\Http\Controllers\EvaluacionIndividualEstudianteController;
use App\Http\Controllers\EvaluacionParController;
use App\Http\Controllers\SeguimientoSemanalController;
use App\Http\Controllers\AutoevaluacionProyectoController;
use App\Http\Controllers\ResultadoAutoevaluacionController;
use App\Http\Controllers\EvaluacionCruzadaController;
use App\Http\Controllers\ResultadoEvaluacionCruzadaController;
use App\Http\Controllers\SprintController;

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
Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/proyectos', [ProyectosController::class, 'index']);
    Route::post('/proyectos', [ProyectosController::class, 'store']);
    Route::put('/proyectos/{id}', [ProyectosController::class, 'update']);
    Route::delete('/proyectos/{id}', [ProyectosController::class, 'destroy']);
    Route::get('/proyectos/{id}', [ProyectosController::class, 'show']);
});

Route::middleware(['auth:estudiante'])->group(function () {
    // Rutas exclusivas para estudiantes
    Route::post('/api/evaluacion-pares/publicar-link/{idAsignacionPar}', [EvaluacionParController::class, 'publicarEnlace']);
    Route::post('/api/evaluacion-pares/agregar-comentario/{idAsignacionPar}', [EvaluacionParController::class, 'agregarComentario']);
});

Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/proyectos/{projectId}/grupos-hora', [GrupoController::class, 'index']);
    Route::post('/grupos', [GrupoController::class, 'store']);
    Route::put('/grupos/{id}', [GrupoController::class, 'update']);
    Route::delete('/grupos/{id}', [GrupoController::class, 'destroy']);
    Route::post('/grupos/{groupId}/registrar', [GrupoController::class, 'registerStudentInGroup']);
    Route::get('/estudiante/{studentId}/registration-status', [GrupoController::class, 'getStudentRegistrationStatus']);
});

Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/proyectos/{projectId}/requerimientos', [RequerimientoController::class, 'index']);
    Route::post('/requerimientos', [RequerimientoController::class, 'store']);
    Route::put('/requerimientos/{id}', [RequerimientoController::class, 'update']); // Ruta de actualización correcta
    Route::delete('/requerimientos/{id}', [RequerimientoController::class, 'destroy']);
    Route::get('/grupos/{id}', [GrupoController::class, 'show']);
});

Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::post('/estudiantes', [EstudianteController::class, 'store']);
    Route::get('/estudiantes', [EstudianteController::class, 'index']);
    Route::delete('/estudiantes/{id}', [EstudianteController::class, 'destroy']);
});

Route::get('/api/estudiantes/grupo/{groupId}', [EstudianteController::class, 'obtenerEstudiantesPorGrupo']);
Route::get('/api/estudiantes/{estudianteId}', [EstudianteController::class, 'obtenerEstudiante']);

// Rutas para actualizar perfil y cambiar contraseña, protegidas por autenticación de docente y estudiante
Route::middleware('auth:docente,estudiante')->group(function () {
    Route::post('/api/usuario-logueado/update', [AuthController::class, 'updateProfile']);
    Route::post('/api/usuario-logueado/change-password', [AuthController::class, 'changePassword']);
    Route::delete('/api/usuario-logueado/delete', [AuthController::class, 'deleteUser']);
});

// Rutas accesibles para cualquier docente autenticado
Route::middleware(['auth:docente'])->prefix('api')->group(function () {
    Route::get('/pending-students', [EstudianteAuthController::class, 'getPendingStudents']);
    Route::post('/approve-student/{id}', [EstudianteAuthController::class, 'approveStudent']);
    Route::get('/count-pending-estudiantes', [EstudianteController::class, 'countPendingStudents']);
});

// Rutas accesibles solo para administradores
Route::middleware(['auth:docente', CheckAdmin::class])->prefix('api')->group(function () {
    Route::get('/pending-users', [DocenteAuthController::class, 'getPendingUsers']);
    Route::post('/approve-user/{id}', [DocenteAuthController::class, 'approveUser']);
    Route::post('/assign-admin/{id}', [DocenteAuthController::class, 'assignAdmin']);
    Route::get('/all-users', [DocenteAuthController::class, 'getAllUsers']);
    Route::get('/pending-teachers', [DocenteAuthController::class, 'getPendingTeachers']);
});


Route::prefix('api')->middleware(['auth:estudiante'])->group(function () {
    Route::delete('/requerimientos/estudiante/{id}', [RequerimientoController::class, 'destroyByStudent']);
    Route::put('/requerimientos/estudiante/{id}', [RequerimientoController::class, 'actualizarParaEstudiante']);
    Route::post('/requerimientos/crear-para-grupo', [RequerimientoController::class, 'crearParaGrupo']);
    Route::post('/fechas_defensa/{defenseId}/registrar', [FechaDefensaController::class, 'registerToDefense']);
});

// Ruta para el registro de usuarios (accesible para ambos roles)
Route::post('/api/register', [AuthController::class, 'register']);
Route::get('/api/projects/all', [ProyectosController::class, 'indexAll']);
Route::post('/api/students/register-to-project/{projectId}', [EstudianteAuthController::class, 'registerToProject']);
Route::get('/api/students/{studentId}/registered-project', [EstudianteAuthController::class, 'getRegisteredProject']);
Route::get('/api/proyectos/{projectId}/grupos-estudiante', [GrupoController::class, 'getGruposForEstudiante']);
Route::put('/api/estudiantes/{id}/rol', [EstudianteController::class, 'updateRole']);

Route::prefix('api')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/historias/{groupId}', [HistoriaUsuarioController::class, 'index']);
    Route::get('/historias-datos/{id}', [HistoriaUsuarioController::class, 'show']);
    Route::post('/historias', [HistoriaUsuarioController::class, 'store']);
    Route::put('/historias/{id}', [HistoriaUsuarioController::class, 'update']);
    Route::delete('/historias/{id}', [HistoriaUsuarioController::class, 'destroy']);
    Route::delete('/imagen-historia/{filname}', [HistoriaUsuarioController::class, 'eliminarImagen']);
    Route::put('/historias/{id}/titulo', [HistoriaUsuarioController::class, 'actualizarTitulo']);
    Route::put('/historias/{id}/descripcion', [HistoriaUsuarioController::class, 'actualizarDescripcion']);
    Route::post('/historias/{id}/subir-imagen', [HistoriaUsuarioController::class, 'subirImagen']);
    Route::post('/historias/{idHu}/tareas', [HistoriaUsuarioController::class, 'agregarTarea']);
    Route::get('/historias/{idHu}/tareas', [HistoriaUsuarioController::class, 'obtenerTareas']);
    Route::delete('/tareas/{idTarea}', [HistoriaUsuarioController::class, 'eliminarTarea']);
    Route::put('/tareas/{id}', [HistoriaUsuarioController::class, 'actualizarTarea']);
    Route::put('tareas/{id}/responsable', [HistoriaUsuarioController::class, 'asignarResponsable']);
});

Route::prefix('api')->group(function () {
    Route::get('/fechas_defensa', [FechaDefensaController::class, 'index']);
    Route::post('/fechas_defensa', [FechaDefensaController::class, 'store']);
    Route::put('/fechas_defensa/{id}', [FechaDefensaController::class, 'update']);
    Route::delete('/fechas_defensa/{id}', [FechaDefensaController::class, 'destroy']);
    Route::get('/proyectos/{projectId}/fechas_defensa/{studentId}', [FechaDefensaController::class, 'getFechasByProject']);
    Route::get('/estudiante/{studentId}/group-defense-registration-status', [FechaDefensaController::class, 'getGroupDefenseRegistrationStatus']); // Obtener estado de registro de defensa del grupo
    Route::get('/fechas_defensa/docente/{projectId}', [FechaDefensaController::class, 'getFechasByProjectForDocente']);
    Route::get('/defensa/grupo/{studentId}', [FechaDefensaController::class, 'getDefenseDateByGroup']);

    Route::get('proyectos/{projectId}/etapas', [EtapaController::class, 'index']);
    Route::post('etapas', [EtapaController::class, 'store']);
    Route::put('etapas/{id}', [EtapaController::class, 'update']);
    Route::delete('etapas/{id}', [EtapaController::class, 'destroy']);
    Route::get('proyectos/{projectId}/etapas', [EtapaController::class, 'getEtapasByProyecto']);

    Route::get('/proyectos/{projectId}/grupos', [ProyectosController::class, 'getProjectGroups']);

    Route::get('/proyectos/{id_proyecto}/grupos-fechas', [ProyectosController::class, 'obtenerGruposYFechas']);

    Route::get('/etapas/{etapaId}', [EtapaController::class, 'show']);

    Route::post('/evaluaciones-individuales-estudiantes', [EvaluacionIndividualEstudianteController::class, 'store']);
    Route::get('/evaluaciones/{estudianteId}/{etapaId}', [EvaluacionIndividualEstudianteController::class, 'show']);
    Route::put('/evaluaciones-individuales-estudiantes/{id}', [EvaluacionIndividualEstudianteController::class, 'update']);
    Route::put('/evaluaciones-individuales/{idEstudiante}/{idEtapa}/falta-retraso', [EvaluacionIndividualEstudianteController::class, 'actualizarFaltaRetraso']);
    Route::get('/evaluaciones-individuales/{idGrupo}/{idEtapa}/falta-retraso', [EvaluacionIndividualEstudianteController::class, 'obtenerFaltaRetrasoPorGrupo']);
    Route::get('/grupos/{groupId}/notas', [EvaluacionIndividualEstudianteController::class, 'obtenerNotasPorGrupo']);
    Route::post('/grupos/{groupId}/notas', [EvaluacionIndividualEstudianteController::class, 'guardarNotas']);
    Route::get('/evaluaciones/etapa/{etapaId}/grupo/{grupoId}', [EvaluacionIndividualEstudianteController::class, 'obtenerEvaluaciones']);

    Route::post('/evaluaciones-pares', [EvaluacionParController::class, 'store']);

    // Obtener todas las evaluaciones de pares de un proyecto específico
    Route::get('/evaluaciones-pares/proyecto/{projectId}', [EvaluacionParController::class, 'index']);
    // Obtener detalles de una evaluación específica
    Route::get('/evaluaciones-pares/{id}', [EvaluacionParController::class, 'show']);
    // Obtener evaluaciones de pares específicas para un proyecto (si lo necesitas)
    Route::get('/evaluaciones-pares/pares/{projectId}', [EvaluacionParController::class, 'obtenerEvaluacionesDePares']);

    Route::get('/evaluacion-cruzada/resultados/{idEvaluacionCruzada}', [ResultadoEvaluacionCruzadaController::class, 'index']);
    Route::post('/evaluacion-cruzada/resultados', [ResultadoEvaluacionCruzadaController::class, 'store']);
    Route::get('/evaluacion-cruzada/{idEvaluacion}/evaluacion/{idEstudiante}', [ResultadoEvaluacionCruzadaController::class, 'obtenerEvaluacionIndividual']);
    Route::delete('/evaluacion-cruzada/resultados/{idResultado}', [ResultadoEvaluacionCruzadaController::class, 'destroy']);
    Route::get('/evaluacion-cruzada/promedio/{idEstudiante}', [ResultadoEvaluacionCruzadaController::class, 'obtenerPromedioEvaluaciones']);
    Route::get('/evaluaciones-cruzadas/grupos/{idGrupo}/notas', [ResultadoEvaluacionCruzadaController::class, 'obtenerResultadosEvaluacionesCruzadasPorGrupo']);

    Route::get('/evaluacion-pares/{id_proyecto}/{id_grupo}', [EvaluacionParController::class, 'obtenerEvaluaciones']);

    Route::post('/sprints', [SprintController::class, 'store']);
    Route::get('/sprints/{groupId}', [SprintController::class, 'index']);
    Route::post('/{sprintId}/asignar-historia', [SprintController::class, 'assignHistoria']); // Asignar historia a sprint
    Route::delete('/{sprintId}', [SprintController::class, 'destroy']); // Eliminar un sprint
});

Route::get('/api/grupos/{groupId}/proyecto/{projectId}/promedio-notas', [EvaluacionParController::class, 'obtenerPromedioNotasPorGrupo']);


Route::prefix('api/seguimiento-semanal')->group(function () {
    // Obtener seguimientos de un proyecto
    Route::get('/{projectId}', [SeguimientoSemanalController::class, 'index']);
    // Obtener seguimientos de un grupo específico dentro de un proyecto
    Route::get('/{projectId}/{groupId}', [SeguimientoSemanalController::class, 'getByGroup']);
    // Crear un nuevo seguimiento
    Route::post('/', [SeguimientoSemanalController::class, 'store']);
    // Actualizar un seguimiento
    Route::put('/{id}', [SeguimientoSemanalController::class, 'update']);
    // Eliminar un seguimiento específico
    Route::delete('/{id}', [SeguimientoSemanalController::class, 'destroy']);
    // Eliminar todos los seguimientos de un grupo
    Route::delete('/grupo/{groupId}', [SeguimientoSemanalController::class, 'deleteByGroup']);
});

// Rutas de la API para rubricas (protegidas con autenticación)
Route::prefix('api/rubricas')->middleware(['auth:docente,estudiante'])->group(function () {
    Route::get('/{projectId}/{etapaId}', [RubricaController::class, 'index']); // Obtener todas las rúbricas por proyecto y etapa
    Route::post('/', [RubricaController::class, 'store']); // Crear nueva rúbrica
    Route::get('/{id}', [RubricaController::class, 'show']); // Ver rúbrica específica
    Route::put('/{id}', [RubricaController::class, 'update']); // Actualizar rúbrica
    Route::delete('/{id}', [RubricaController::class, 'destroy']); // Eliminar rúbrica
});

Route::prefix('api/evaluaciones-individuales')->group(function () {
    Route::get('/proyecto/{projectId}', [EvaluacionIndividualController::class, 'index']); // Obtener todas las evaluaciones de un proyecto
    Route::post('/', [EvaluacionIndividualController::class, 'store']); // Crear nueva evaluación
    Route::get('/{examenId}', [EvaluacionIndividualController::class, 'show']);
    Route::put('/{id}', [EvaluacionIndividualController::class, 'update']); // Actualizar evaluación
    Route::delete('/{id}', [EvaluacionIndividualController::class, 'destroy']); // Eliminar evaluación
});

Route::prefix('api/proyectos/{projectId}/autoevaluaciones')->group(function () {
    Route::post('/', [AutoevaluacionProyectoController::class, 'store']); // Crear autoevaluación
    Route::get('/', [AutoevaluacionProyectoController::class, 'index']);  // Obtener autoevaluaciones
    Route::put('/{autoevaluacionId}', [AutoevaluacionProyectoController::class, 'update']); // Actualizar autoevaluación
    Route::put('/pregunta/{preguntaId}', [AutoevaluacionProyectoController::class, 'updatePregunta']); // Actualizar pregunta
    Route::delete('/{autoevaluacionId}', [AutoevaluacionProyectoController::class, 'destroy']); // Eliminar autoevaluación
    Route::delete('/pregunta/{preguntaId}', [AutoevaluacionProyectoController::class, 'destroyPregunta']); // Eliminar pregunta
    Route::delete('/opcion/{opcionId}', [AutoevaluacionProyectoController::class, 'destroyOpcion']); // Eliminar opción
    Route::put('/pregunta/{preguntaId}/opciones', [AutoevaluacionProyectoController::class, 'updateOpciones']); // Actualizar opciones
    Route::post('/pregunta', [AutoevaluacionProyectoController::class, 'addPregunta']);
});

Route::post('/autoevaluaciones/resultados', [ResultadoAutoevaluacionController::class, 'guardarResultado']);
Route::get('/autoevaluaciones/resultados', [ResultadoAutoevaluacionController::class, 'index']);
Route::get('api/autoevaluaciones/grupos/{idGrupo}/notas', [ResultadoAutoevaluacionController::class, 'obtenerNotasPorGrupo']);


Route::prefix('api/proyectos/{projectId}/evaluacion-cruzada')->group(function () {
    Route::post('/', [EvaluacionCruzadaController::class, 'store']);
    Route::get('/', [EvaluacionCruzadaController::class, 'index']);
    Route::put('/{evaluacionId}', [EvaluacionCruzadaController::class, 'update']);
    Route::delete('/{evaluacionId}', [EvaluacionCruzadaController::class, 'destroy']);

    // Rutas para preguntas
    Route::post('/{evaluacionId}/preguntas', [EvaluacionCruzadaController::class, 'addPregunta']);
    Route::put('/preguntas/{preguntaId}', [EvaluacionCruzadaController::class, 'updatePregunta']);


    // Rutas para opciones
    Route::post('/preguntas/{preguntaId}/opciones', [EvaluacionCruzadaController::class, 'addOpcion']);
});

Route::delete('/api/evaluacion-cruzada/opciones/{opcionId}', [EvaluacionCruzadaController::class, 'destroyOpcion']);
Route::delete('/api/evaluacion-cruzada/preguntas/{preguntaId}', [EvaluacionCruzadaController::class, 'destroyPregunta']);

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