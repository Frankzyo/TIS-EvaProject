<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EvaluacionPar;
use App\Models\EvaluacionParGrupo;
use App\Models\Grupo;
use App\Models\EvaluacionParEstudiante;
use App\Models\EnlaceProyecto;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Log;

class EvaluacionParController extends Controller
{
    // Registrar una evaluación de pares
    public function store(Request $request)
    {
        try {
            // Validar los datos recibidos
            $validated = $request->validate([
                'id_proyecto' => 'required|string|exists:proyecto,id_proyecto',
                'titulo' => 'required|string|max:255', // Validación del título
                'descripcion' => 'nullable|string|max:500', // Validación de descripción
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'nota_maxima' => 'required|integer|min:1',
                'grupos' => 'required|array|min:2',
                'grupos.*' => 'integer|exists:grupo,id_grupo',
            ]);

            // Crear la evaluación de pares
            $evaluacion = EvaluacionPar::create([
                'id_proyecto' => $request->id_proyecto,
                'titulo' => $request->titulo, // Guardar el título
                'descripcion' => $request->descripcion, // Guardar la descripción
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'nota_maxima' => $request->nota_maxima,
            ]);

            // Log para verificar el ID generado
            Log::info('ID de Evaluación creado', ['id' => $evaluacion->id_evaluacion_par]);

            $grupos = $request->grupos;
            $totalGrupos = count($grupos);

            // Crear las asignaciones de evaluación
            foreach ($grupos as $index => $id_grupo_evaluador) {
                $id_grupo_evaluado = $grupos[($index + 1) % $totalGrupos];

                EvaluacionParGrupo::create([
                    'id_evaluacion_par' => $evaluacion->id_evaluacion_par, // Usar la clave primaria correcta
                    'id_grupo_evaluador' => $id_grupo_evaluador,
                    'id_grupo_evaluado' => $id_grupo_evaluado,
                ]);

                // Log para verificar las asignaciones creadas
                Log::info('Asignación de evaluación creada', [
                    'id_evaluacion_par' => $evaluacion->id_evaluacion_par,
                    'id_grupo_evaluador' => $id_grupo_evaluador,
                    'id_grupo_evaluado' => $id_grupo_evaluado,
                ]);
            }

            return response()->json([
                'message' => 'Evaluación de pares creada exitosamente',
                'evaluacion' => $evaluacion,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación', ['errors' => $e->errors()]);
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error interno', ['exception' => $e]);
            return response()->json([
                'message' => 'Error interno en el servidor',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function index($projectId)
    {
        try {
            $evaluaciones = EvaluacionPar::with([
                'gruposEvaluadores.grupoEvaluador',
                'gruposEvaluados.grupoEvaluado'
            ])
                ->where('id_proyecto', $projectId)
                ->get();

            return response()->json([
                'evaluaciones' => $evaluaciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las evaluaciones',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerEvaluacionesDePares($projectId)
    {
        try {
            $evaluaciones = EvaluacionParGrupo::with([
                'grupoEvaluador',
                'grupoEvaluado',
            ])->whereHas('evaluacionPar', function ($query) use ($projectId) {
                $query->where('id_proyecto', $projectId);
            })->get();

            return response()->json([
                'evaluaciones' => $evaluaciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las evaluaciones de pares',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $evaluacion = EvaluacionPar::with([
                'gruposEvaluadores.grupoEvaluador',
                'gruposEvaluados.grupoEvaluado',
            ])->findOrFail($id);

            return response()->json([
                'evaluacion' => $evaluacion,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la evaluación',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerEvaluaciones($id_proyecto, $id_grupo)
    {
        try {
            // Obtener la evaluación por pares correspondiente al proyecto
            $evaluacionPar = EvaluacionPar::where('id_proyecto', $id_proyecto)->first();
    
            if (!$evaluacionPar) {
                return response()->json(['error' => 'No se encontró la evaluación para este proyecto.'], 404);
            }
    
            // Obtener las asignaciones con sus relaciones (enlace, evaluaciones de estudiantes, y estudiantes)
            $evaluacionesGrupos = EvaluacionParGrupo::with(['enlaceProyecto', 'estudiantesEvaluacion.estudiante'])
                ->where('id_evaluacion_par', $evaluacionPar->id_evaluacion_par)
                ->where(function ($query) use ($id_grupo) {
                    $query->where('id_grupo_evaluador', $id_grupo)
                        ->orWhere('id_grupo_evaluado', $id_grupo);
                })
                ->get();
    
            // Mapear los datos con detalles adicionales
            $asignacionesConDetalles = $evaluacionesGrupos->map(function ($asignacion) {
                $grupoEvaluador = Grupo::find($asignacion->id_grupo_evaluador);
                $grupoEvaluado = Grupo::find($asignacion->id_grupo_evaluado);
    
                // Obtener los comentarios, calificaciones y detalles del estudiante
                $comentariosYNotas = $asignacion->estudiantesEvaluacion->map(function ($evaluacionEstudiante) {
                    return [
                        'comentarios' => $evaluacionEstudiante->comentarios,
                        'calificacion' => $evaluacionEstudiante->calificacion,
                        'estudiante' => $evaluacionEstudiante->estudiante ? [
                            'id' => $evaluacionEstudiante->estudiante->ID_EST,
                            'nombre' => $evaluacionEstudiante->estudiante->NOMBRE_EST,
                            'apellido' => $evaluacionEstudiante->estudiante->APELLIDO_EST,
                            'foto' => $evaluacionEstudiante->estudiante->FOTO_EST,
                        ] : null,
                    ];
                });
    
                return [
                    'id_asignacion_par' => $asignacion->id_asignacion_par,
                    'id_evaluacion_par' => $asignacion->id_evaluacion_par,
                    'id_grupo_evaluador' => $asignacion->id_grupo_evaluador,
                    'grupo_evaluador' => $grupoEvaluador ? $grupoEvaluador->only(['NOMBRE_GRUPO', 'PORTADA_GRUPO']) : null,
                    'id_grupo_evaluado' => $asignacion->id_grupo_evaluado,
                    'grupo_evaluado' => $grupoEvaluado ? $grupoEvaluado->only(['NOMBRE_GRUPO', 'PORTADA_GRUPO']) : null,
                    'comentarios_y_notas' => $comentariosYNotas, // Incluye los comentarios, calificaciones e información del estudiante
                    'link_proyecto' => $asignacion->enlaceProyecto->link_proyecto ?? null, // Incluye el enlace del proyecto
                    'created_at' => $asignacion->created_at,
                    'updated_at' => $asignacion->updated_at,
                ];
            });
    
            // Retornar la evaluación y las asignaciones con detalles
            return response()->json([
                'evaluacion' => $evaluacionPar,
                'asignaciones' => $asignacionesConDetalles,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocurrió un error al cargar los datos.', 'mensaje' => $e->getMessage()], 500);
        }
    }
    
    public function publicarEnlace(Request $request, $idAsignacionPar)
    {
        $request->validate([
            'link_proyecto' => 'required|url|max:500',
        ]);

        $asignacion = EvaluacionParGrupo::find($idAsignacionPar);

        if (!$asignacion) {
            return response()->json(['message' => 'Asignación no encontrada.'], 404);
        }

        // Crear o actualizar enlace del proyecto
        $enlace = EnlaceProyecto::updateOrCreate(
            ['id_asignacion_par' => $idAsignacionPar],
            ['link_proyecto' => $request->link_proyecto]
        );

        return response()->json(['message' => 'Enlace publicado exitosamente.', 'enlace' => $enlace], 200);
    }

    // Guardar comentario y calificación
    public function agregarComentario(Request $request, $idAsignacionPar)
{
    $request->validate([
        'comentarios' => 'required|string|max:500',
        'calificacion' => 'required|integer|min:1', // Validación de rango inicial
    ]);

    $asignacion = EvaluacionParGrupo::find($idAsignacionPar);

    if (!$asignacion) {
        return response()->json(['message' => 'Asignación no encontrada.'], 404);
    }

    // Obtener la evaluación para verificar la nota máxima
    $evaluacion = $asignacion->evaluacion; // Asumiendo que existe una relación entre EvaluacionParGrupo y EvaluacionPar

    if (!$evaluacion) {
        return response()->json(['message' => 'Evaluación no encontrada.'], 404);
    }

    // Validar que la calificación no exceda la nota máxima
    if ($request->calificacion > $evaluacion->nota_maxima) {
        return response()->json([
            'message' => "La calificación no puede exceder la nota máxima permitida de {$evaluacion->nota_maxima}.",
        ], 422);
    }

    // Obtener el ID del estudiante logueado
    $idEstudiante = auth('estudiante')->id();

    // Buscar si ya existe un comentario para este estudiante y asignación
    $comentarioExistente = EvaluacionParEstudiante::where('id_asignacion_par', $idAsignacionPar)
        ->where('id_est', $idEstudiante)
        ->first();

    if ($comentarioExistente) {
        // Actualizar el comentario existente
        $comentarioExistente->update([
            'comentarios' => $request->comentarios,
            'calificacion' => $request->calificacion,
        ]);

        return response()->json([
            'message' => 'Comentario actualizado exitosamente.',
            'evaluacion' => $comentarioExistente,
        ], 200);
    } else {
        // Crear un nuevo comentario si no existe
        $nuevoComentario = EvaluacionParEstudiante::create([
            'id_asignacion_par' => $idAsignacionPar,
            'id_est' => $idEstudiante,
            'comentarios' => $request->comentarios,
            'calificacion' => $request->calificacion,
        ]);

        return response()->json([
            'message' => 'Comentario creado exitosamente.',
            'evaluacion' => $nuevoComentario,
        ], 201);
    }
}

public function obtenerPromedioNotasPorGrupo($groupId, $projectId)
{
    try {
        // Obtener los estudiantes del grupo
        $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get(['ID_EST', 'NOMBRE_EST', 'APELLIDO_EST', 'EMAIL_EST']);

        if ($estudiantes->isEmpty()) {
            return response()->json(['message' => 'No se encontraron estudiantes para este grupo'], 404);
        }

        // Obtener las evaluaciones a pares relacionadas con el proyecto y grupo evaluado
        $evaluaciones = EvaluacionPar::where('id_proyecto', $projectId)
            ->whereHas('asignaciones', function ($query) use ($groupId) {
                $query->where('id_grupo_evaluado', $groupId);
            })
            ->with(['asignaciones.comentarios_y_notas'])
            ->get();

        if ($evaluaciones->isEmpty()) {
            return response()->json(['message' => 'No se encontraron evaluaciones para este grupo'], 404);
        }

        // Calcular el promedio de las calificaciones por grupo
        $promedioNotas = $evaluaciones->flatMap(function ($evaluacion) {
            return $evaluacion->asignaciones->flatMap(function ($asignacion) {
                return $asignacion->comentarios_y_notas->pluck('calificacion');
            });
        })->average();

        // Formatear la respuesta con estudiantes y las notas
        $resultado = $estudiantes->map(function ($estudiante) use ($evaluaciones, $promedioNotas) {
            return [
                'estudiante' => [
                    'ID_ESTUDIANTE' => $estudiante->ID_EST,
                    'NOMBRE' => $estudiante->NOMBRE_EST,
                    'APELLIDO' => $estudiante->APELLIDO_EST,
                    'EMAIL_EST' => $estudiante->EMAIL_EST,
                ],
                'notas' => $evaluaciones->map(function ($evaluacion) use ($promedioNotas) {
                    return [
                        'ID_ETAPA' => $evaluacion->id_evaluacion_par,
                        'FECHA_REVISION' => $evaluacion->fecha_inicio,
                        'PUNTUACION_TOTAL' => number_format($promedioNotas ?: 0, 2),
                        'ETAPA_TITULO' => $evaluacion->titulo,
                        'ETAPA_PUNTUACION' => $evaluacion->nota_maxima,
                    ];
                })->values(), // Asegura que las notas sean un arreglo
            ];
        });

        return response()->json($resultado, 200);
    } catch (\Exception $e) {
        Log::error('Error al obtener el promedio de notas por grupo: ' . $e->getMessage());
        return response()->json(['error' => 'Error al obtener el promedio de notas por grupo'], 500);
    }
}

}
