<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ResultadoAutoevaluacion;
use Illuminate\Support\Facades\DB;
use App\Models\Estudiante;

class ResultadoAutoevaluacionController extends Controller
{
    public function guardarResultado(Request $request)
    {
        $validatedData = $request->validate([
            'ID_AUTOEVAL_PROYECTO' => 'required|integer|exists:autoevaluaciones_proyecto,ID_AUTOEVAL_PROYECTO',
            'ID_GRUPO' => 'required|integer|exists:grupo,ID_GRUPO',
            'ID_EST' => 'required|integer|exists:estudiante,ID_EST',
            'NOMBRE_AUTOEVAL' => 'required|string|max:255',
            'PUNTUACION_MAXIMA_AUTOEVAL' => 'required|integer',
            'PUNTUACION_OBTENIDA' => 'required|numeric',
            'FECHA_INICIO' => 'required|date',
        ]);

        try {
            // Crear un nuevo registro en la tabla
            $resultado = ResultadoAutoevaluacion::create($validatedData);

            return response()->json([
                'message' => 'Resultado de autoevaluación guardado exitosamente.',
                'data' => $resultado,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al guardar el resultado.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function index(Request $request)
    {
        $idEstudiante = $request->query('ID_EST');
        $idGrupo = $request->query('ID_GRUPO');
        $idProyecto = $request->query('ID_PROYECTO');

        try {
            // Construir la consulta utilizando Eloquent
            $query = ResultadoAutoevaluacion::with('autoevaluacion')
                ->select(
                    'resultados_autoevaluacion.*',
                    'autoevaluaciones_proyecto.TITULO_AUTOEVAL',
                    'autoevaluaciones_proyecto.PUNTUACION_TOTAL_AUTOEVAL'
                )
                ->join(
                    'autoevaluaciones_proyecto',
                    'resultados_autoevaluacion.ID_AUTOEVAL_PROYECTO',
                    '=',
                    'autoevaluaciones_proyecto.ID_AUTOEVAL_PROYECTO'
                );

            // Aplicar filtros opcionales
            if ($idEstudiante) {
                $query->where('resultados_autoevaluacion.ID_EST', $idEstudiante);
            }
            if ($idGrupo) {
                $query->where('resultados_autoevaluacion.ID_GRUPO', $idGrupo);
            }
            if ($idProyecto) {
                $query->where('autoevaluaciones_proyecto.ID_PROYECTO', $idProyecto);
            }

            // Ejecutar la consulta
            $resultados = $query->get();

            // Verificar si hay resultados
            if ($resultados->isEmpty()) {
                return response()->json([
                    'message' => 'No se encontraron resultados para los filtros aplicados.',
                ], 404);
            }

            return response()->json($resultados, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al obtener los resultados.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function obtenerNotasPorGrupo($idGrupo)
{
    try {
        // Obtener estudiantes del grupo
        $estudiantes = DB::table('estudiante')
            ->where('ID_GRUPO', $idGrupo)
            ->select('ID_EST', 'NOMBRE_EST', 'APELLIDO_EST', 'EMAIL_EST')
            ->get();

        // Iterar estudiantes para obtener resultados de autoevaluación
        $response = $estudiantes->map(function ($estudiante) use ($idGrupo) {
            // Obtener autoevaluaciones para el grupo y estudiante
            $resultados = DB::table('resultados_autoevaluacion')
                ->where('ID_GRUPO', $idGrupo)
                ->where('ID_EST', $estudiante->ID_EST)
                ->select(
                    'ID_AUTOEVAL_PROYECTO',
                    'FECHA_INICIO as FECHA_REVISION',
                    'PUNTUACION_OBTENIDA as PUNTUACION_TOTAL',
                    'NOMBRE_AUTOEVAL as ETAPA_TITULO',
                    'PUNTUACION_MAXIMA_AUTOEVAL as ETAPA_PUNTUACION',
                )
                ->get();

            return [
                'estudiante' => [
                    'ID_ESTUDIANTE' => $estudiante->ID_EST,
                    'NOMBRE' => $estudiante->NOMBRE_EST,
                    'APELLIDO' => $estudiante->APELLIDO_EST,
                    'EMAIL_EST' => $estudiante->EMAIL_EST,
                ],
                'notas' => $resultados,
            ];
        });

        return response()->json($response, 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al obtener notas: ' . $e->getMessage()], 500);
    }
}

}
