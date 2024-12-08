<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionCruzada;
use App\Models\PreguntaEvaluacionCruzada;
use App\Models\OpcionEvaluacionCruzada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class EvaluacionCruzadaController extends Controller
{
    /**
     * Crear una nueva evaluación cruzada.
     */
    public function store(Request $request, $projectId)
    {
        Log::info('Datos recibidos para guardar evaluación cruzada:', $request->all());

        // Validación de los datos
        try {
            $validated = $request->validate([
                'TITULO_EVAL_CRUZADA' => 'required|string|max:255', // Nombre corregido
                'DESCRIPCION_EVAL_CRUZADA' => 'nullable|string',
                'FECHA_INICIO_EVAL' => 'required|date',
                'FECHA_FIN_EVAL' => 'required|date|after_or_equal:FECHA_INICIO_EVAL',
                'PUNTUACION_TOTAL_EVAL' => 'required|numeric|min:0',
                'evaluaciones' => 'required|array|min:1',
                'evaluaciones.*.pregunta' => 'required|string|max:255',
                'evaluaciones.*.opciones' => 'required|array|min:1',
                'evaluaciones.*.opciones.*.texto' => 'required|string|max:255',
                'evaluaciones.*.opciones.*.puntuacion' => 'required|numeric|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Errores de validación:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Usar transacción para garantizar atomicidad
        try {
            DB::transaction(function () use ($projectId, $validated) {
                // Crear la evaluación cruzada
                $evaluacion = EvaluacionCruzada::create([
                    'ID_PROYECTO' => $projectId,
                    'TITULO_EVAL_CRUZADA' => $validated['TITULO_EVAL_CRUZADA'], // Nombre corregido
                    'DESCRIPCION_EVAL_CRUZADA' => $validated['DESCRIPCION_EVAL_CRUZADA'],
                    'FECHA_INICIO_EVAL' => $validated['FECHA_INICIO_EVAL'],
                    'FECHA_FIN_EVAL' => $validated['FECHA_FIN_EVAL'],
                    'PUNTUACION_TOTAL_EVAL' => $validated['PUNTUACION_TOTAL_EVAL'],
                ]);

                Log::info('ID_EVAL_CRUZADA generado:', ['ID_EVAL_CRUZADA' => $evaluacion->ID_EVAL_CRUZADA]);

                // Crear preguntas y opciones
                foreach ($validated['evaluaciones'] as $pregunta) {
                    $preguntaModel = PreguntaEvaluacionCruzada::create([
                        'ID_EVAL_CRUZADA' => $evaluacion->ID_EVAL_CRUZADA,
                        'PREGUNTA_EVAL' => $pregunta['pregunta'],
                    ]);

                    foreach ($pregunta['opciones'] as $opcion) {
                        OpcionEvaluacionCruzada::create([
                            'ID_PREGUNTA_EVAL' => $preguntaModel->ID_PREGUNTA_EVAL,
                            'TEXTO_OPCION_EVAL' => $opcion['texto'],
                            'PUNTUACION_OPCION_EVAL' => $opcion['puntuacion'],
                        ]);
                    }
                }
            });

            return response()->json(['message' => 'Evaluación cruzada creada con éxito'], 201);
        } catch (\Exception $e) {
            Log::error('Error al guardar la evaluación cruzada:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al crear la evaluación cruzada', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Listar todas las evaluaciones cruzadas de un proyecto.
     */
    public function index($projectId)
    {
        $evaluaciones = EvaluacionCruzada::where('ID_PROYECTO', $projectId)
            ->with(['preguntas.opciones']) // Incluye las relaciones necesarias
            ->get();

        return response()->json([
            'message' => 'Evaluaciones cruzadas obtenidas con éxito.',
            'data' => $evaluaciones,
        ], 200);
    }

    /**
     * Actualizar una evaluación cruzada.
     */
    public function update(Request $request, $projectId, $evaluacionId)
    {
        // Validar datos recibidos
        $validated = $request->validate([
            'TITULO_EVAL_CRUZADA' => 'required|string|max:255',
            'DESCRIPCION_EVAL_CRUZADA' => 'nullable|string',
            'FECHA_INICIO_EVAL' => 'required|date',
            'FECHA_FIN_EVAL' => 'required|date|after_or_equal:FECHA_INICIO_EVAL',
            'PUNTUACION_TOTAL_EVAL' => 'required|integer|min:0',
            'evaluaciones' => 'nullable|array',
            'evaluaciones.*.ID_PREGUNTA_EVAL' => 'nullable|integer|exists:preguntas_evaluacion_cruzada,ID_PREGUNTA_EVAL',
            'evaluaciones.*.PREGUNTA_EVAL' => 'required|string|max:255',
            'evaluaciones.*.opciones' => 'nullable|array',
            'evaluaciones.*.opciones.*.ID_OPCION_EVAL' => 'nullable|integer|exists:opciones_pregunta_evaluacion_cruzada,ID_OPCION_EVAL',
            'evaluaciones.*.opciones.*.TEXTO_OPCION_EVAL' => 'required|string|max:255',
            'evaluaciones.*.opciones.*.PUNTUACION_OPCION_EVAL' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated, $projectId, $evaluacionId) {
                // Buscar evaluación
                $evaluacion = EvaluacionCruzada::where('ID_PROYECTO', $projectId)
                    ->where('ID_EVAL_CRUZADA', $evaluacionId)
                    ->firstOrFail();

                // Actualizar evaluación
                $evaluacion->update([
                    'TITULO_EVAL_CRUZADA' => $validated['TITULO_EVAL_CRUZADA'],
                    'DESCRIPCION_EVAL_CRUZADA' => $validated['DESCRIPCION_EVAL_CRUZADA'],
                    'FECHA_INICIO_EVAL' => $validated['FECHA_INICIO_EVAL'],
                    'FECHA_FIN_EVAL' => $validated['FECHA_FIN_EVAL'],
                    'PUNTUACION_TOTAL_EVAL' => $validated['PUNTUACION_TOTAL_EVAL'],
                ]);

                // Procesar preguntas
                $preguntaIdsEnviadas = collect($validated['evaluaciones'])->pluck('ID_PREGUNTA_EVAL')->filter();

                // Eliminar preguntas no enviadas
                PreguntaEvaluacionCruzada::where('ID_EVAL_CRUZADA', $evaluacionId)
                    ->whereNotIn('ID_PREGUNTA_EVAL', $preguntaIdsEnviadas)
                    ->delete();

                // Procesar preguntas y sus opciones
                foreach ($validated['evaluaciones'] as $preguntaData) {
                    $pregunta = PreguntaEvaluacionCruzada::updateOrCreate(
                        ['ID_PREGUNTA_EVAL' => $preguntaData['ID_PREGUNTA_EVAL'] ?? null],
                        [
                            'ID_EVAL_CRUZADA' => $evaluacion->ID_EVAL_CRUZADA,
                            'PREGUNTA_EVAL' => $preguntaData['PREGUNTA_EVAL'],
                        ]
                    );

                    // Procesar opciones de cada pregunta
                    $opcionIdsEnviadas = collect($preguntaData['opciones'])->pluck('ID_OPCION_EVAL')->filter();

                    // Eliminar opciones no enviadas
                    OpcionEvaluacionCruzada::where('ID_PREGUNTA_EVAL', $pregunta->ID_PREGUNTA_EVAL)
                        ->whereNotIn('ID_OPCION_EVAL', $opcionIdsEnviadas)
                        ->delete();

                    // Crear o actualizar opciones
                    foreach ($preguntaData['opciones'] as $opcionData) {
                        OpcionEvaluacionCruzada::updateOrCreate(
                            ['ID_OPCION_EVAL' => $opcionData['ID_OPCION_EVAL'] ?? null],
                            [
                                'ID_PREGUNTA_EVAL' => $pregunta->ID_PREGUNTA_EVAL,
                                'TEXTO_OPCION_EVAL' => $opcionData['TEXTO_OPCION_EVAL'],
                                'PUNTUACION_OPCION_EVAL' => $opcionData['PUNTUACION_OPCION_EVAL'],
                            ]
                        );
                    }
                }
            });

            return response()->json(['message' => 'Evaluación cruzada actualizada con éxito'], 200);
        } catch (\Exception $e) {
            Log::error('Error al actualizar la evaluación cruzada:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al actualizar la evaluación cruzada', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar una evaluación cruzada.
     */
    public function destroy($projectId, $evaluacionId)
    {
        try {
            $evaluacion = EvaluacionCruzada::where('ID_PROYECTO', $projectId)
                ->where('ID_EVAL_CRUZADA', $evaluacionId)
                ->firstOrFail();

            $evaluacion->delete();

            return response()->json(['message' => 'Evaluación cruzada eliminada con éxito'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la evaluación cruzada', 'error' => $e->getMessage()], 500);
        }
    }

    public function addPregunta(Request $request, $evaluacionId)
    {
        $validated = $request->validate([
            'PREGUNTA_EVAL' => 'required|string|max:255',
            'opciones' => 'required|array|min:1',
            'opciones.*.texto' => 'required|string|max:255',
            'opciones.*.puntuacion' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($evaluacionId, $validated, &$pregunta) {
                $pregunta = PreguntaEvaluacionCruzada::create([
                    'ID_EVAL_CRUZADA' => $evaluacionId,
                    'PREGUNTA_EVAL' => $validated['PREGUNTA_EVAL'],
                ]);

                foreach ($validated['opciones'] as $opcion) {
                    OpcionEvaluacionCruzada::create([
                        'ID_PREGUNTA_EVAL' => $pregunta->ID_PREGUNTA_EVAL,
                        'TEXTO_OPCION_EVAL' => $opcion['texto'],
                        'PUNTUACION_OPCION_EVAL' => $opcion['puntuacion'],
                    ]);
                }
            });

            return response()->json([
                'message' => 'Pregunta añadida con éxito',
                'pregunta' => $pregunta,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al agregar la pregunta:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error al agregar la pregunta', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Editar una pregunta existente.
     */
    public function updatePregunta(Request $request, $preguntaId)
    {
        $validated = $request->validate([
            'PREGUNTA_EVAL' => 'required|string|max:255',
            'opciones' => 'required|array',
            'opciones.*.ID_OPCION_EVAL' => 'nullable|integer',
            'opciones.*.texto' => 'required|string|max:255',
            'opciones.*.puntuacion' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($preguntaId, $validated) {
                // Actualizar la pregunta
                $pregunta = PreguntaEvaluacionCruzada::findOrFail($preguntaId);
                $pregunta->update(['PREGUNTA_EVAL' => $validated['PREGUNTA_EVAL']]);

                // Obtener los IDs de las opciones enviadas
                $idsOpcionesEnviadas = collect($validated['opciones'])->pluck('ID_OPCION_EVAL')->filter();

                // Eliminar opciones no enviadas
                OpcionEvaluacionCruzada::where('ID_PREGUNTA_EVAL', $preguntaId)
                    ->whereNotIn('ID_OPCION_EVAL', $idsOpcionesEnviadas)
                    ->delete();

                // Crear o actualizar opciones
                collect($validated['opciones'])->each(function ($opcion) use ($preguntaId) {
                    OpcionEvaluacionCruzada::updateOrCreate(
                        ['ID_OPCION_EVAL' => $opcion['ID_OPCION_EVAL'] ?? null],
                        [
                            'ID_PREGUNTA_EVAL' => $preguntaId,
                            'TEXTO_OPCION_EVAL' => $opcion['texto'],
                            'PUNTUACION_OPCION_EVAL' => $opcion['puntuacion'],
                        ]
                    );
                });
            });

            return response()->json(['message' => 'Pregunta y opciones actualizadas con éxito'], 200);
        } catch (\Exception $e) {
            Log::error('Error al actualizar la pregunta:', [
                'preguntaId' => $preguntaId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Error al actualizar la pregunta',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una pregunta y sus opciones.
     */
    public function destroyPregunta($preguntaId)
    {
        try {
            DB::transaction(function () use ($preguntaId) {
                // Eliminar opciones relacionadas con la pregunta
                OpcionEvaluacionCruzada::where('ID_PREGUNTA_EVAL', $preguntaId)->delete();

                // Eliminar la pregunta
                PreguntaEvaluacionCruzada::findOrFail($preguntaId)->delete();
            });

            return response()->json(['message' => 'Pregunta eliminada con éxito'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la pregunta', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar una opción específica.
     */
    public function destroyOpcion($opcionId)
    {
        try {
            Log::info("Intentando eliminar opción con ID: $opcionId");

            // Verifica si el ID recibido corresponde a una opción
            $opcion = OpcionEvaluacionCruzada::find($opcionId);

            if (!$opcion) {
                Log::warning("Opción no encontrada con ID: $opcionId");
                return response()->json(['message' => 'La opción no existe'], 404);
            }

            $opcion->delete();

            Log::info("Opción eliminada con éxito. ID: $opcionId");
            return response()->json(['message' => 'Opción eliminada con éxito'], 200);
        } catch (\Exception $e) {
            Log::error("Error al eliminar la opción: {$e->getMessage()}");
            return response()->json(['message' => 'Error al eliminar la opción', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Agregar una nueva opción a una pregunta.
     */
    public function addOpcion(Request $request, $preguntaId)
    {
        $validated = $request->validate([
            'texto' => 'required|string|max:255',
            'puntuacion' => 'required|integer|min:0',
        ]);

        try {
            $pregunta = PreguntaEvaluacionCruzada::find($preguntaId);

            if (!$pregunta) {
                return response()->json(['message' => 'La pregunta no existe'], 404);
            }

            $opcion = OpcionEvaluacionCruzada::create([
                'ID_PREGUNTA_EVAL' => $preguntaId,
                'TEXTO_OPCION_EVAL' => $validated['texto'],
                'PUNTUACION_OPCION_EVAL' => $validated['puntuacion'],
            ]);

            return response()->json(['message' => 'Opción creada con éxito', 'opcion' => $opcion], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear la opción', 'error' => $e->getMessage()], 500);
        }
    }
}
