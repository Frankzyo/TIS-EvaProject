<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionIndividualEstudiante;
use App\Models\NotaRubrica;
use App\Models\NotaCriterio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $pesoCriterioAjustado = ($pesoCriterio / $pesoRubrica) * $pesoRubricaAjustado;
        return ($puntuacion / $maxPuntos) * $pesoCriterioAjustado;
    }

    public function show($idEstudiante, $idEtapa)
    {
        try {
            // Obtener la evaluación individual
            $evaluacion = EvaluacionIndividualEstudiante::with('notasRubricas.notasCriterios')
                ->where('ID_ESTUDIANTE', $idEstudiante)
                ->where('ID_ETAPA', $idEtapa)
                ->first();

            // Validar si la evaluación existe
            if (!$evaluacion) {
                return response()->json([
                    'message' => 'Evaluación no encontrada para el estudiante y la etapa especificada.'
                ], 404);
            }

            // Construir la respuesta con las rúbricas y criterios
            $notasRubricas = $evaluacion->notasRubricas->map(function ($notaRubrica) {
                return [
                    'ID_RUBRICA' => $notaRubrica->ID_RUBRICA,
                    'NOMBRE_RUBRICA' => $notaRubrica->rubrica->NOMBRE_RUBRICA ?? 'Sin Nombre',
                    'PUNTUACION_OBTENIDA' => $notaRubrica->PUNTUACION_OBTENIDA,
                    'PUNTUACION_NO_AJUSTADA' => $notaRubrica->PUNTUACION_NO_AJUSTADA,
                    'PESO_RUBRICA' => $notaRubrica->rubrica->PESO_RUBRICA ?? 0,
                    'criterios' => $notaRubrica->notasCriterios->map(function ($notaCriterio) {
                        return [
                            'ID_CRITERIO' => $notaCriterio->ID_CRITERIO,
                            'NOMBRE_CRITERIO' => $notaCriterio->criterio->NOMBRE_CRITERIO ?? 'Sin Nombre',
                            'PESO_CRITERIO' => $notaCriterio->criterio->PESO_CRITERIO ?? 0,
                            'PUNTUACION_OBTENIDA' => $notaCriterio->PUNTUACION_OBTENIDA,
                            'PUNTUACION_NO_AJUSTADA' => $notaCriterio->PUNTUACION_NO_AJUSTADA,
                        ];
                    }),
                ];
            });

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
        // Validación de los datos
        $validatedData = $request->validate([
            'FECHA_REVISION' => 'nullable|date',
            'rubricas' => 'required|array|min:1',
            'rubricas.*.ID_RUBRICA' => 'required|exists:rubricas,ID_RUBRICA',
            'rubricas.*.criterios' => 'required|array|min:1',
            'rubricas.*.criterios.*.ID_CRITERIO' => 'required|exists:criterios,ID_CRITERIO',
            'rubricas.*.criterios.*.PUNTUACION_SIN_AJUSTAR' => 'required|numeric|min:0',
        ]);

        // Buscar la evaluación
        $evaluacion = EvaluacionIndividualEstudiante::find($idEvaluacion);

        if (!$evaluacion) {
            return response()->json(['message' => 'Evaluación no encontrada.'], 404);
        }

        DB::beginTransaction();

        // Actualizar la fecha de revisión si está presente
        if (isset($validatedData['FECHA_REVISION'])) {
            $evaluacion->update(['FECHA_REVISION' => $validatedData['FECHA_REVISION']]);
        }

        $totalPuntajeAjustado = 0;
        $totalPuntajeSinAjustar = 0;

        // Obtener la puntuación máxima de la etapa
        $etapaPuntajeTotal = DB::table('etapas')
            ->where('ID_ETAPA', $evaluacion->ID_ETAPA)
            ->value('ETAPAS_PUNTUACION');

        foreach ($validatedData['rubricas'] as $rubricaData) {
            $notaRubrica = NotaRubrica::where('ID_EVALUACION_INDIVIDUAL', $idEvaluacion)
                ->where('ID_RUBRICA', $rubricaData['ID_RUBRICA'])
                ->first();

            if (!$notaRubrica) {
                return response()->json([
                    'message' => 'Rúbrica no encontrada en la evaluación.',
                    'rubrica_id' => $rubricaData['ID_RUBRICA'],
                ], 404);
            }

            $puntajeRubricaAjustada = 0;
            $puntajeRubricaSinAjustar = 0;

            foreach ($rubricaData['criterios'] as $criterioData) {
                $notaCriterio = NotaCriterio::where('ID_NOTA_RUBRICA', $notaRubrica->ID_NOTA_RUBRICA)
                    ->where('ID_CRITERIO', $criterioData['ID_CRITERIO'])
                    ->first();

                if (!$notaCriterio) {
                    return response()->json([
                        'message' => 'Criterio no encontrado en la rúbrica.',
                        'criterio_id' => $criterioData['ID_CRITERIO'],
                    ], 404);
                }

                // Obtener los niveles y su puntaje máximo
                $niveles = DB::table('niveles')
                    ->where('ID_CRITERIO', $criterioData['ID_CRITERIO'])
                    ->pluck('PUNTOS');
                $maxPuntos = $niveles->max();

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

        return response()->json([
            'message' => 'Evaluación actualizada correctamente.',
            'data' => $evaluacion->load(['notasRubricas.notasCriterios']),
        ], 200);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Ocurrió un error al actualizar la evaluación.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}
