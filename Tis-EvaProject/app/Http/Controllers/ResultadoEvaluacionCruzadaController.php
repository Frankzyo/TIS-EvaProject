<?php

namespace App\Http\Controllers;

use App\Models\ResultadoEvaluacionCruzada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ResultadoEvaluacionCruzadaController extends Controller
{
    // Método para obtener los resultados de una evaluación cruzada específica
    public function index($idEvaluacionCruzada, Request $request)
    {
        try {
            $query = ResultadoEvaluacionCruzada::where('ID_EVAL_CRUZADA', $idEvaluacionCruzada)
                ->with(['evaluador', 'evaluado']);

            if ($request->has('ID_ESTUDIANTE')) {
                $query->where('ID_EST_EVALUADO', $request->get('ID_ESTUDIANTE'));
            }

            $resultados = $query->get();

            return response()->json([
                'message' => 'Resultados obtenidos con éxito.',
                'data' => $resultados,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los resultados.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Método para guardar un resultado de evaluación cruzada
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'ID_EVAL_CRUZADA' => 'required|exists:evaluaciones_cruzadas,ID_EVAL_CRUZADA',
            'ID_EST_EVALUADOR' => 'required|exists:estudiante,ID_EST',
            'ID_EST_EVALUADO' => 'required|exists:estudiante,ID_EST',
            'PUNTUACION_OBTENIDA' => 'required|numeric|min:0',
        ]);

        try {
            $resultado = ResultadoEvaluacionCruzada::create($validatedData);

            return response()->json([
                'message' => 'Resultado guardado con éxito.',
                'data' => $resultado,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al guardar el resultado.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Método para obtener los resultados de un estudiante en una evaluación cruzada
    public function obtenerEvaluacionIndividual($idEvaluacion, $idEvaluado)
    {
        try {
            $idEvaluador = request()->query('ID_EVALUADOR');
    
            $evaluacion = ResultadoEvaluacionCruzada::where('ID_EVAL_CRUZADA', $idEvaluacion)
                ->where('ID_EST_EVALUADO', $idEvaluado)
                ->where('ID_EST_EVALUADOR', $idEvaluador)
                ->first();
    
            if ($evaluacion) {
                return response()->json([
                    'message' => 'Evaluación encontrada.',
                    'data' => $evaluacion,
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No se encontró la evaluación para el evaluador y evaluado especificados.',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la evaluación.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    // Método para eliminar un resultado
    public function destroy($idResultado)
    {
        try {
            $resultado = ResultadoEvaluacionCruzada::findOrFail($idResultado);
            $resultado->delete();

            return response()->json([
                'message' => 'Resultado eliminado con éxito.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el resultado.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function obtenerPromedioEvaluaciones($idEstudiante)
    {
        try {
            $promedio = ResultadoEvaluacionCruzada::where('ID_EST_EVALUADO', $idEstudiante)
                ->avg('PUNTUACION_OBTENIDA');

            Log::info("Promedio calculado para el estudiante {$idEstudiante}: {$promedio}");

            return response()->json([
                'message' => 'Promedio obtenido con éxito.',
                'promedio' => $promedio,
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error al calcular promedio: {$e->getMessage()}");

            return response()->json([
                'message' => 'Error al calcular el promedio.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerResultadosEvaluacionesCruzadasPorGrupo($idGrupo)
{
    try {
        // Obtener estudiantes del grupo
        $estudiantes = DB::table('estudiante')
            ->where('ID_GRUPO', $idGrupo)
            ->select('ID_EST', 'NOMBRE_EST', 'APELLIDO_EST', 'EMAIL_EST')
            ->get();

        // Iterar estudiantes para obtener las evaluaciones cruzadas y sus resultados
        $resultados = $estudiantes->map(function ($estudiante) {
            // Obtener evaluaciones cruzadas para el proyecto relacionado al grupo
            $evaluaciones = DB::table('evaluaciones_cruzadas')
                ->join('resultados_evaluacion_cruzada', 'evaluaciones_cruzadas.ID_EVAL_CRUZADA', '=', 'resultados_evaluacion_cruzada.ID_EVAL_CRUZADA')
                ->where('resultados_evaluacion_cruzada.ID_EST_EVALUADO', $estudiante->ID_EST)
                ->select(
                    'evaluaciones_cruzadas.ID_EVAL_CRUZADA',
                    'evaluaciones_cruzadas.TITULO_EVAL_CRUZADA as ETAPA_TITULO',
                    'evaluaciones_cruzadas.FECHA_INICIO_EVAL as FECHA_REVISION',
                    'evaluaciones_cruzadas.PUNTUACION_TOTAL_EVAL as ETAPA_PUNTUACION',
                    DB::raw('AVG(resultados_evaluacion_cruzada.PUNTUACION_OBTENIDA) as PUNTUACION_TOTAL')
                )
                ->groupBy('evaluaciones_cruzadas.ID_EVAL_CRUZADA', 'ETAPA_TITULO', 'FECHA_REVISION', 'ETAPA_PUNTUACION')
                ->get();

            return [
                'estudiante' => [
                    'ID_ESTUDIANTE' => $estudiante->ID_EST,
                    'NOMBRE' => $estudiante->NOMBRE_EST,
                    'APELLIDO' => $estudiante->APELLIDO_EST,
                    'EMAIL_EST' => $estudiante->EMAIL_EST,
                ],
                'notas' => $evaluaciones,
            ];
        });

        return response()->json($resultados, 200);
    } catch (\Exception $e) {
        Log::error("Error al obtener resultados por grupo: {$e->getMessage()}");
        return response()->json([
            'message' => 'Error al obtener resultados.',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}
