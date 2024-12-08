<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionIndividualEstudiante;
use App\Models\NotaRubrica;
use App\Models\NotaCriterio;
use App\Models\Rubrica;
use App\Models\Etapa;
use App\Models\Grupo;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluacionIndividualEstudianteController extends Controller
{
    public function store(Request $request)
    {
        // Validación de los datos
        try {
            $validatedData = $request->validate([
                'ID_ESTUDIANTE' => 'required|exists:estudiante,ID_EST',
                'ID_ETAPA' => 'required|exists:etapas,ID_ETAPA',
                'ID_GRUPO' => 'required|exists:grupo,ID_GRUPO',
                'FECHA_REVISION' => 'required|date',
                'FALTA' => 'nullable|boolean',
                'RETRASO' => 'nullable|boolean',
                'rubricas' => 'required|array|min:1',
                'rubricas.*.ID_RUBRICA' => 'required|exists:rubricas,ID_RUBRICA',
                'rubricas.*.PESO_RUBRICA' => 'required|numeric|min:0|max:100',
                'rubricas.*.criterios' => 'required|array|min:1',
                'rubricas.*.criterios.*.ID_CRITERIO' => 'required|exists:criterios,ID_CRITERIO',
                'rubricas.*.criterios.*.PESO_CRITERIO' => 'nullable|numeric|min:0|max:100',
                'rubricas.*.criterios.*.PUNTUACION_SIN_AJUSTAR' => 'required|numeric|min:0', // Campo requerido
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        // Iniciar una transacción
        DB::beginTransaction();

        try {
            // Crear la evaluación individual
            $evaluacion = EvaluacionIndividualEstudiante::create([
                'ID_ESTUDIANTE' => $validatedData['ID_ESTUDIANTE'],
                'ID_ETAPA' => $validatedData['ID_ETAPA'],
                'ID_GRUPO' => $validatedData['ID_GRUPO'],
                'FECHA_REVISION' => $validatedData['FECHA_REVISION'],
                'FALTA' => $validatedData['FALTA'] ?? false,
                'RETRASO' => $validatedData['RETRASO'] ?? false,
                'PUNTUACION_TOTAL' => 0,
                'PUNTUACION_NO_AJUSTADA' => 0,
            ]);

            $totalPuntajeAjustado = 0;
            $totalPuntajeSinAjustar = 0;

            // Obtener la puntuación máxima de la etapa
            $etapaPuntajeTotal = DB::table('etapas')
                ->where('ID_ETAPA', $validatedData['ID_ETAPA'])
                ->value('ETAPAS_PUNTUACION');

            foreach ($validatedData['rubricas'] as $rubrica) {
                $pesoRubricaAjustado = ($rubrica['PESO_RUBRICA'] / 100) * $etapaPuntajeTotal;

                $notaRubrica = NotaRubrica::create([
                    'ID_EVALUACION_INDIVIDUAL' => $evaluacion->ID_EVALUACION_INDIVIDUAL,
                    'ID_RUBRICA' => $rubrica['ID_RUBRICA'],
                    'PUNTUACION_OBTENIDA' => 0,
                    'PUNTUACION_NO_AJUSTADA' => 0,
                ]);

                $puntajeRubricaAjustada = 0;
                $puntajeRubricaSinAjustar = 0;

                foreach ($rubrica['criterios'] as $criterio) {
                    $pesoCriterio = $criterio['PESO_CRITERIO'] ?? 0;
                    $puntuacionSinAjustar = $criterio['PUNTUACION_SIN_AJUSTAR'] ?? 0;

                    // Obtener los niveles y su puntaje máximo
                    $niveles = DB::table('niveles')
                        ->where('ID_CRITERIO', $criterio['ID_CRITERIO'])
                        ->pluck('PUNTOS');
                    $maxPuntos = $niveles->max();

                    // Calcular la puntuación ajustada
                    $puntuacionAjustada = $this->calcularPuntuacionAjustada(
                        $puntuacionSinAjustar,
                        $pesoCriterio,
                        $rubrica['PESO_RUBRICA'],
                        $pesoRubricaAjustado,
                        $maxPuntos
                    );

                    // Crear la nota del criterio
                    NotaCriterio::create([
                        'ID_NOTA_RUBRICA' => $notaRubrica->ID_NOTA_RUBRICA,
                        'ID_CRITERIO' => $criterio['ID_CRITERIO'],
                        'PUNTUACION_OBTENIDA' => $puntuacionAjustada,
                        'PUNTUACION_NO_AJUSTADA' => $puntuacionSinAjustar,
                    ]);

                    $puntajeRubricaAjustada += $puntuacionAjustada;
                    $puntajeRubricaSinAjustar += $puntuacionSinAjustar;
                }

                $notaRubrica->update([
                    'PUNTUACION_OBTENIDA' => $puntajeRubricaAjustada,
                    'PUNTUACION_NO_AJUSTADA' => $puntajeRubricaSinAjustar,
                ]);

                $totalPuntajeAjustado += $puntajeRubricaAjustada;
                $totalPuntajeSinAjustar += $puntajeRubricaSinAjustar;
            }

            $evaluacion->update([
                'PUNTUACION_TOTAL' => $totalPuntajeAjustado,
                'PUNTUACION_NO_AJUSTADA' => $totalPuntajeSinAjustar,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Evaluación y notas registradas correctamente.',
                'data' => $evaluacion->load(['notasRubricas.notasCriterios']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Ocurrió un error al registrar la evaluación.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function calcularPuntuacionAjustada($puntuacion, $pesoCriterio, $pesoRubrica, $pesoRubricaAjustado, $maxPuntos)
    {
        if ($pesoCriterio <= 0 || $pesoRubrica <= 0 || $maxPuntos <= 0) {
            return 0; // Retornar 0 si alguno de los valores no es válido
        }
        $pesoCriterioAjustado = ($pesoCriterio / $pesoRubrica) * $pesoRubricaAjustado;
        return ($puntuacion / $maxPuntos) * $pesoCriterioAjustado;
    }

    public function show($idEstudiante, $idEtapa)
    {
        try {
            // Obtener todas las rúbricas asociadas a la etapa
            $rubricas = Rubrica::where('ID_ETAPA', $idEtapa)
                ->with(['criterios.niveles'])
                ->get();

            // Obtener la evaluación individual
            $evaluacion = EvaluacionIndividualEstudiante::with('notasRubricas.notasCriterios')
                ->where('ID_ESTUDIANTE', $idEstudiante)
                ->where('ID_ETAPA', $idEtapa)
                ->first();

            // Si no existe evaluación, devolver solo las rúbricas con criterios y niveles
            if (!$evaluacion) {
                return response()->json([
                    'message' => 'El estudiante aún no tiene evaluación registrada para esta etapa.',
                    'notas_rubricas' => $rubricas->map(function ($rubrica) {
                        return [
                            'ID_RUBRICA' => $rubrica->ID_RUBRICA,
                            'NOMBRE_RUBRICA' => $rubrica->NOMBRE_RUBRICA,
                            'PESO_RUBRICA' => $rubrica->PESO_RUBRICA,
                            'criterios' => $rubrica->criterios->map(function ($criterio) {
                                return [
                                    'ID_CRITERIO' => $criterio->ID_CRITERIO,
                                    'NOMBRE_CRITERIO' => $criterio->NOMBRE_CRITERIO,
                                    'DESCRIPCION_CRITERIO' => $criterio->DESCRIPCION_CRITERIO,
                                    'PESO_CRITERIO' => $criterio->PESO_CRITERIO,
                                    'PUNTUACION_NO_AJUSTADA' => null, // Nota aún no asignada
                                    'niveles' => $criterio->niveles->map(function ($nivel) {
                                        return [
                                            'ID_NIVEL' => $nivel->ID_NIVEL,
                                            'TITULO_NIVEL' => $nivel->TITULO_NIVEL,
                                            'PUNTOS' => $nivel->PUNTOS,
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ], 200);
            }

            // Construir las rúbricas combinando las existentes y las asociadas sin notas
            $notasRubricas = $rubricas->map(function ($rubrica) use ($evaluacion) {
                $notaRubrica = $evaluacion->notasRubricas->firstWhere('ID_RUBRICA', $rubrica->ID_RUBRICA);

                return [
                    'ID_RUBRICA' => $rubrica->ID_RUBRICA,
                    'NOMBRE_RUBRICA' => $rubrica->NOMBRE_RUBRICA,
                    'PESO_RUBRICA' => $rubrica->PESO_RUBRICA,
                    'PUNTUACION_NO_AJUSTADA' => $notaRubrica->PUNTUACION_NO_AJUSTADA ?? null,
                    'PUNTUACION_OBTENIDA' => $notaRubrica->PUNTUACION_OBTENIDA ?? null,
                    'criterios' => $rubrica->criterios->map(function ($criterio) use ($notaRubrica) {
                        $notaCriterio = $notaRubrica
                            ? $notaRubrica->notasCriterios->firstWhere('ID_CRITERIO', $criterio->ID_CRITERIO)
                            : null;

                        return [
                            'ID_CRITERIO' => $criterio->ID_CRITERIO,
                            'NOMBRE_CRITERIO' => $criterio->NOMBRE_CRITERIO,
                            'DESCRIPCION_CRITERIO' => $criterio->DESCRIPCION_CRITERIO,
                            'PESO_CRITERIO' => $criterio->PESO_CRITERIO,
                            'PUNTUACION_NO_AJUSTADA' => $notaCriterio->PUNTUACION_NO_AJUSTADA ?? null,
                            'PUNTUACION_OBTENIDA' => $notaCriterio->PUNTUACION_OBTENIDA ?? null,
                            'niveles' => $criterio->niveles->map(function ($nivel) {
                                return [
                                    'ID_NIVEL' => $nivel->ID_NIVEL,
                                    'TITULO_NIVEL' => $nivel->TITULO_NIVEL,
                                    'PUNTOS' => $nivel->PUNTOS,
                                ];
                            }),
                        ];
                    }),
                ];
            });

            // Devolver rúbricas combinadas con las notas de la evaluación
            return response()->json([
                'ID_EVALUACION' => $evaluacion->ID_EVALUACION_INDIVIDUAL,
                'FECHA_REVISION' => $evaluacion->FECHA_REVISION,
                'notas_rubricas' => $notasRubricas,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al obtener la evaluación.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function update(Request $request, $idEvaluacion)
    {
        try {
            // Iniciar el registro de logs para depuración
            Log::info('Inicio de actualización de evaluación:', ['id' => $idEvaluacion]);

            // Validar los datos enviados
            $validatedData = $request->validate([
                'FECHA_REVISION' => 'nullable|date',
                'rubricas' => 'required|array|min:1',
                'rubricas.*.ID_RUBRICA' => 'required|exists:rubricas,ID_RUBRICA',
                'rubricas.*.criterios' => 'required|array|min:1',
                'rubricas.*.criterios.*.ID_CRITERIO' => 'required|exists:criterios,ID_CRITERIO',
                'rubricas.*.criterios.*.PUNTUACION_SIN_AJUSTAR' => 'required|numeric|min:0',
            ]);

            Log::info('Datos validados:', $validatedData);

            // Buscar la evaluación en la base de datos
            $evaluacion = EvaluacionIndividualEstudiante::find($idEvaluacion);

            if (!$evaluacion) {
                Log::warning('Evaluación no encontrada:', ['id' => $idEvaluacion]);
                return response()->json(['message' => 'Evaluación no encontrada.'], 404);
            }

            Log::info('Estado de la evaluación antes de actualizar:', $evaluacion->toArray());

            // Bloquear evaluación si el estudiante tiene falta asignada
            if ($evaluacion->FALTA) {
                Log::warning('Intento de evaluar a un estudiante con falta asignada.', ['id' => $idEvaluacion]);
                return response()->json([
                    'message' => 'No se puede evaluar a un estudiante con falta asignada.'
                ], 400);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Actualizar la fecha de revisión si se proporciona
            if (isset($validatedData['FECHA_REVISION'])) {
                $evaluacion->update(['FECHA_REVISION' => $validatedData['FECHA_REVISION']]);
                Log::info('Fecha de revisión actualizada:', ['FECHA_REVISION' => $validatedData['FECHA_REVISION']]);
            }

            $totalPuntajeAjustado = 0;
            $totalPuntajeSinAjustar = 0;

            // Obtener la puntuación máxima de la etapa
            $etapaPuntajeTotal = DB::table('etapas')
                ->where('ID_ETAPA', $evaluacion->ID_ETAPA)
                ->value('ETAPAS_PUNTUACION');

            if (!$etapaPuntajeTotal || $etapaPuntajeTotal <= 0) {
                Log::error('Puntuación total de la etapa no válida.', ['ID_ETAPA' => $evaluacion->ID_ETAPA]);
                return response()->json(['message' => 'Puntuación total de la etapa no válida.'], 400);
            }

            // Procesar cada rúbrica y criterio
            foreach ($validatedData['rubricas'] as $rubricaData) {
                // Intentar encontrar la rúbrica asociada a la evaluación
                $notaRubrica = NotaRubrica::firstOrCreate(
                    [
                        'ID_EVALUACION_INDIVIDUAL' => $idEvaluacion,
                        'ID_RUBRICA' => $rubricaData['ID_RUBRICA'],
                    ],
                    [
                        'PUNTUACION_OBTENIDA' => 0,
                        'PUNTUACION_NO_AJUSTADA' => 0,
                    ]
                );

                if (!$notaRubrica) {
                    Log::warning('No se pudo crear o encontrar la rúbrica.', ['ID_RUBRICA' => $rubricaData['ID_RUBRICA']]);
                    continue;
                }

                $puntajeRubricaAjustada = 0;
                $puntajeRubricaSinAjustar = 0;

                foreach ($rubricaData['criterios'] as $criterioData) {
                    // Intentar encontrar o crear la nota del criterio
                    $notaCriterio = NotaCriterio::firstOrCreate(
                        [
                            'ID_NOTA_RUBRICA' => $notaRubrica->ID_NOTA_RUBRICA,
                            'ID_CRITERIO' => $criterioData['ID_CRITERIO'],
                        ],
                        [
                            'PUNTUACION_OBTENIDA' => 0,
                            'PUNTUACION_NO_AJUSTADA' => 0,
                        ]
                    );

                    // Obtener los niveles y su puntaje máximo
                    $niveles = DB::table('niveles')
                        ->where('ID_CRITERIO', $criterioData['ID_CRITERIO'])
                        ->pluck('PUNTOS');
                    $maxPuntos = $niveles->max();

                    if (!$maxPuntos || $maxPuntos <= 0) {
                        Log::error('Puntaje máximo no válido para el criterio.', ['ID_CRITERIO' => $criterioData['ID_CRITERIO']]);
                        return response()->json(['message' => 'Puntaje máximo no válido para el criterio.'], 400);
                    }

                    // Calcular la puntuación ajustada
                    $puntuacionAjustada = $this->calcularPuntuacionAjustada(
                        $criterioData['PUNTUACION_SIN_AJUSTAR'],
                        $notaCriterio->criterio->PESO_CRITERIO ?? 0,
                        $notaRubrica->rubrica->PESO_RUBRICA ?? 0,
                        ($notaRubrica->rubrica->PESO_RUBRICA / 100) * $etapaPuntajeTotal,
                        $maxPuntos
                    );

                    // Actualizar la nota del criterio
                    $notaCriterio->update([
                        'PUNTUACION_OBTENIDA' => $puntuacionAjustada,
                        'PUNTUACION_NO_AJUSTADA' => $criterioData['PUNTUACION_SIN_AJUSTAR'],
                    ]);

                    $puntajeRubricaAjustada += $puntuacionAjustada;
                    $puntajeRubricaSinAjustar += $criterioData['PUNTUACION_SIN_AJUSTAR'];
                }

                // Actualizar la nota de la rúbrica
                $notaRubrica->update([
                    'PUNTUACION_OBTENIDA' => $puntajeRubricaAjustada,
                    'PUNTUACION_NO_AJUSTADA' => $puntajeRubricaSinAjustar,
                ]);

                $totalPuntajeAjustado += $puntajeRubricaAjustada;
                $totalPuntajeSinAjustar += $puntajeRubricaSinAjustar;
            }

            // Actualizar la evaluación con las nuevas puntuaciones totales
            $evaluacion->update([
                'PUNTUACION_TOTAL' => $totalPuntajeAjustado,
                'PUNTUACION_NO_AJUSTADA' => $totalPuntajeSinAjustar,
            ]);

            DB::commit();

            Log::info('Evaluación actualizada exitosamente:', $evaluacion->toArray());

            return response()->json([
                'message' => 'Evaluación actualizada correctamente.',
                'data' => $evaluacion->load(['notasRubricas.notasCriterios']),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar la evaluación:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Ocurrió un error al actualizar la evaluación.'], 500);
        }
    }

    public function actualizarFaltaRetraso(Request $request, $idEstudiante, $idEtapa)
    {
        try {
            // Validar los datos enviados
            $validatedData = $request->validate([
                'FALTA' => 'required|boolean',
                'RETRASO' => 'required|boolean',
            ]);

            // Obtener el grupo del estudiante desde la tabla correcta
            $grupo = DB::table('estudiante') // Cambiado de 'estudiantes' a 'estudiante'
                ->where('ID_EST', $idEstudiante)
                ->value('ID_GRUPO');

            if (!$grupo) {
                return response()->json([
                    'message' => 'El estudiante no pertenece a un grupo, no se puede crear la evaluación.',
                ], 422);
            }

            // Verificar si ya existe una evaluación para este estudiante y etapa
            $evaluacion = EvaluacionIndividualEstudiante::where('ID_ESTUDIANTE', $idEstudiante)
                ->where('ID_ETAPA', $idEtapa)
                ->first();

            if ($evaluacion) {
                // Actualizar la evaluación existente
                $evaluacion->update([
                    'FALTA' => $validatedData['FALTA'],
                    'RETRASO' => $validatedData['RETRASO'],
                ]);

                $message = 'Datos de falta y retraso actualizados correctamente.';
            } else {
                // Crear una nueva evaluación para el estudiante
                $evaluacion = EvaluacionIndividualEstudiante::create([
                    'ID_ESTUDIANTE' => $idEstudiante,
                    'ID_ETAPA' => $idEtapa,
                    'ID_GRUPO' => $grupo,
                    'FECHA_REVISION' => now(),
                    'FALTA' => $validatedData['FALTA'],
                    'RETRASO' => $validatedData['RETRASO'],
                    'PUNTUACION_TOTAL' => 0,
                    'PUNTUACION_NO_AJUSTADA' => 0,
                ]);

                $message = 'Evaluación creada y datos de falta y retraso asignados correctamente.';
            }

            // Respuesta exitosa
            return response()->json([
                'message' => $message,
                'data' => $evaluacion,
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            // Manejo de errores de consulta
            return response()->json([
                'message' => 'Error al procesar la solicitud.',
                'error' => $e->getMessage(),
            ], 500);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Manejo de errores de validación
            return response()->json([
                'message' => 'Error en los datos enviados.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Manejo de errores generales
            return response()->json([
                'message' => 'Error al procesar la solicitud.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerFaltaRetrasoPorGrupo($idGrupo, $idEtapa)
    {
        try {
            // Obtener todas las evaluaciones para los estudiantes del grupo y etapa
            $evaluaciones = EvaluacionIndividualEstudiante::where('ID_GRUPO', $idGrupo)
                ->where('ID_ETAPA', $idEtapa)
                ->get(['ID_ESTUDIANTE', 'FALTA', 'RETRASO']);

            return response()->json([
                'message' => 'Estados de falta y retraso obtenidos correctamente.',
                'data' => $evaluaciones,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los estados de falta y retraso.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerNotasPorGrupo($groupId)
    {
        try {
            // Obtener estudiantes del grupo
            $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get(['ID_EST', 'NOMBRE_EST', 'APELLIDO_EST', 'EMAIL_EST']);

            if ($estudiantes->isEmpty()) {
                return response()->json(['message' => 'No se encontraron estudiantes para este grupo'], 404);
            }

            // Obtener las evaluaciones individuales asociadas a los estudiantes
            $notas = EvaluacionIndividualEstudiante::whereIn('ID_ESTUDIANTE', $estudiantes->pluck('ID_EST'))
                ->with('etapa') // Relación con la etapa
                ->get(['ID_ESTUDIANTE', 'ID_ETAPA', 'FECHA_REVISION', 'PUNTUACION_TOTAL', 'FALTA', 'RETRASO']);

            // Formatear la respuesta con estudiantes y sus notas
            $resultado = $estudiantes->map(function ($estudiante) use ($notas) {
                $notasEstudiante = $notas->where('ID_ESTUDIANTE', $estudiante->ID_EST);

                return [
                    'estudiante' => [
                        'ID_ESTUDIANTE' => $estudiante->ID_EST,
                        'NOMBRE' => $estudiante->NOMBRE_EST,
                        'APELLIDO' => $estudiante->APELLIDO_EST,
                        'EMAIL_EST' => $estudiante->EMAIL_EST, // Agregar email del estudiante
                    ],
                    'notas' => $notasEstudiante->map(function ($nota) {
                        return [
                            'ID_ETAPA' => $nota->ID_ETAPA,
                            'FECHA_REVISION' => $nota->FECHA_REVISION,
                            'PUNTUACION_TOTAL' => $nota->PUNTUACION_TOTAL,
                            'ETAPA_TITULO' => $nota->etapa->ETAPAS_TITULO ?? null, // Título de la etapa
                            'ETAPA_PUNTUACION' => $nota->etapa->ETAPAS_PUNTUACION ?? null, // Puntuación de la etapa
                            'FALTA' => $nota->FALTA ? true : false, // Indica si tiene falta
                            'RETRASO' => $nota->RETRASO ? true : false, // Indica si tiene retraso
                        ];
                    })->values(), // Asegura que las notas sean un arreglo
                ];
            });

            return response()->json($resultado, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener las notas del grupo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener las notas del grupo'], 500);
        }
    }
    public function guardarNotas(Request $request, $groupId)
    {
        try {
            $notasData = $request->input('studentsData'); // Obtiene las notas del frontend

            foreach ($notasData as $data) {
                $estudianteId = $data['ID_ESTUDIANTE'];

                foreach ($data['notas'] as $nota) {
                    // Ignorar notas de autoevaluaciones o evaluaciones cruzadas
                    if (isset($nota['ID_AUTOEVAL_PROYECTO']) || isset($nota['ID_EVAL_CRUZADA'])) {
                        continue;
                    }

                    // Actualizar la nota si ya existe o crearla si no
                    EvaluacionIndividualEstudiante::updateOrCreate(
                        [
                            'ID_ESTUDIANTE' => $estudianteId,
                            'ID_ETAPA' => $nota['ID_ETAPA'],
                        ],
                        [
                            'FECHA_REVISION' => $nota['FECHA_REVISION'],
                            'PUNTUACION_TOTAL' => $nota['PUNTUACION_TOTAL'],
                            'FALTA' => $nota['FALTA'] ?? false,
                            'RETRASO' => $nota['RETRASO'] ?? false,
                        ]
                    );
                }
            }

            return response()->json(['message' => 'Notas guardadas exitosamente'], 200);
        } catch (\Exception $e) {
            Log::error('Error al guardar las notas: ' . $e->getMessage());
            return response()->json(['error' => 'Error al guardar las notas'], 500);
        }
    }

    public function obtenerEvaluaciones($etapaId, $grupoId)
    {
        try {
            // Obtener datos de la etapa
            $etapa = Etapa::findOrFail($etapaId);

            // Obtener el grupo con sus estudiantes
            $grupo = Grupo::with(['estudiantes'])->findOrFail($grupoId);

            if ($grupo->estudiantes->isEmpty()) {
                return response()->json(['error' => 'El grupo no tiene estudiantes asociados.'], 404);
            }

            // Obtener todas las evaluaciones individuales para la etapa y grupo
            $evaluaciones = EvaluacionIndividualEstudiante::where('ID_ETAPA', $etapaId)
                ->where('ID_GRUPO', $grupoId)
                ->with(['notasRubricas.rubrica'])
                ->get();

            // Preparar los datos para la respuesta
            $data = [
                'etapa' => [
                    'titulo' => $etapa->ETAPAS_TITULO,
                    'puntuacion' => $etapa->ETAPAS_PUNTUACION,
                ],
                'grupo' => [
                    'nombre' => $grupo->NOMBRE_GRUPO,
                ],
                'evaluaciones' => $grupo->estudiantes->map(function ($estudiante) use ($evaluaciones, $etapa) {
                    // Buscar evaluación del estudiante
                    $evaluacion = $evaluaciones->firstWhere('ID_ESTUDIANTE', $estudiante->ID_EST);

                    // Preparar datos de las rúbricas
                    $rubricas = $evaluacion
                        ? $evaluacion->notasRubricas->map(function ($notaRubrica) use ($etapa) {
                            $puntuacionAjustada = ($notaRubrica->PUNTUACION_NO_AJUSTADA / 100) * $etapa->ETAPAS_PUNTUACION;

                            return [
                                'rubrica_id' => $notaRubrica->ID_RUBRICA,
                                'nombre_rubrica' => $notaRubrica->rubrica->NOMBRE_RUBRICA,
                                'peso_rubrica' => $notaRubrica->rubrica->PESO_RUBRICA,
                                'puntuacion_no_ajustada' => $notaRubrica->PUNTUACION_NO_AJUSTADA,
                                'puntuacion_ajustada' => round($puntuacionAjustada, 2),
                            ];
                        })
                        : [];

                    return [
                        'estudiante' => [
                            'id' => $estudiante->ID_EST,
                            'nombre' => $estudiante->NOMBRE_EST,
                            'apellido' => $estudiante->APELLIDO_EST,
                            'email' => $estudiante->EMAIL_EST, // Agregar email del estudiante
                        ],
                        'evaluacion' => $evaluacion
                            ? [
                                'puntuacion_total' => $evaluacion->PUNTUACION_TOTAL,
                                'puntuacion_no_ajustada' => $evaluacion->PUNTUACION_NO_AJUSTADA,
                                'retraso' => $evaluacion->RETRASO,
                                'falta' => $evaluacion->FALTA,
                                'rubricas' => $rubricas,
                                'fecha_revision' => $evaluacion->FECHA_REVISION, // Agregado
                            ]
                            : null, // Sin evaluación registrada
                    ];
                })->values(), // Asegurar que los resultados sean un arreglo indexado
            ];

            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener los datos',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
