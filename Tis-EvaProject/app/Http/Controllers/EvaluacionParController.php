<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EvaluacionPar;
use App\Models\EvaluacionParGrupo;
use Illuminate\Support\Facades\Log;

class EvaluacionParController extends Controller
{
    // Registrar una evaluación de pares
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_proyecto' => 'required|string|exists:proyecto,id_proyecto',
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
                'nota_maxima' => 'required|integer|min:1',
                'grupos' => 'required|array|min:2',
                'grupos.*' => 'integer|exists:grupo,id_grupo',
            ]);

            // Crear la evaluación de pares
            $evaluacion = EvaluacionPar::create([
                'id_proyecto' => $request->id_proyecto,
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
        $evaluaciones = EvaluacionPar::with(['gruposEvaluadores.grupoEvaluador', 'gruposEvaluados.grupoEvaluado'])
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

}
