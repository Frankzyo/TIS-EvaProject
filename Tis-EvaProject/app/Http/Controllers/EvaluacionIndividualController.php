<?php

namespace App\Http\Controllers;

use App\Models\EvaluacionIndividual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EvaluacionIndividualController extends Controller
{
    // Obtener todas las evaluaciones individuales de un proyecto específico
    public function index($projectId)
    {
        $evaluaciones = EvaluacionIndividual::with(['grupo', 'etapa'])
            ->where('ID_PROYECTO', $projectId)
            ->get()
            ->map(function ($evaluacion) {
                // Obtener el representante legal del grupo
                $representanteLegal = $evaluacion->grupo->estudiantes()
                    ->where('IS_RL', 1)
                    ->first();

                // Formato de hora personalizado
                $horaInicio = date('H:i', strtotime($evaluacion->fecha_defensa->HR_INIDEF ?? '00:00:00'));
                $horaFin = date('H:i', strtotime($evaluacion->fecha_defensa->HR_FINDEF ?? '00:00:00'));

                return [
                    'ID_EVALUACION' => $evaluacion->ID_EVALUACION,
                    'grupoNombre' => $evaluacion->grupo->NOMBRE_GRUPO ?? 'Sin Grupo',
                    'grupoFoto' => $evaluacion->grupo->PORTADA_GRUPO
                        ? url("storage/{$evaluacion->grupo->PORTADA_GRUPO}")
                        : "https://via.placeholder.com/50",
                    'defensaDia' => $evaluacion->fecha_defensa->day ?? 'No asignado',
                    'defensaHora' => "{$horaInicio} a {$horaFin}",

                    'etapaNombre' => $evaluacion->etapa->ETAPAS_TITULO ?? 'Sin Etapa',
                    'representanteLegal' => $representanteLegal ? [
                        'nombre' => $representanteLegal->NOMBRE_EST,
                        'apellido' => $representanteLegal->APELLIDO_EST,
                        'foto' => $representanteLegal->FOTO_EST
                            ? url("storage/{$representanteLegal->FOTO_EST}")
                            : "https://via.placeholder.com/50",
                    ] : null,
                ];
            });

        return response()->json($evaluaciones);
    }

    // Crear una nueva evaluación individual
    // Crear una nueva evaluación individual
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'grupoId' => 'required|exists:grupo,ID_GRUPO',
                'etapaId' => 'required|exists:etapas,ID_ETAPA',
                'projectId' => 'required|exists:proyecto,ID_PROYECTO',
            ]);

            // Verificar si ya existe un examen para el grupo, etapa y proyecto
            $examenExistente = EvaluacionIndividual::where([
                ['ID_GRUPO', $validatedData['grupoId']],
                ['ID_ETAPA', $validatedData['etapaId']],
                ['ID_PROYECTO', $validatedData['projectId']],
            ])->first();

            if ($examenExistente) {
                return response()->json(['error' => 'Ya existe un examen para este grupo y etapa en el proyecto.'], 400);
            }

            $evaluacion = EvaluacionIndividual::create([
                'ID_GRUPO' => $validatedData['grupoId'],
                'ID_ETAPA' => $validatedData['etapaId'],
                'ID_PROYECTO' => $validatedData['projectId'],
            ]);

            return response()->json($evaluacion, 201);
        } catch (\Exception $e) {
            Log::error('Error al crear la evaluación individual: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al crear la evaluación individual',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    // Obtener una evaluación individual específica
    public function show($examenId)
    {
        try {
            $evaluacion = EvaluacionIndividual::with(['grupo', 'etapa'])
                ->findOrFail($examenId);

            $representanteLegal = $evaluacion->grupo->estudiantes()
                ->where('IS_RL', 1)
                ->first();

            return response()->json([
                'ID_EVALUACION' => $evaluacion->ID_EVALUACION,
                'ID_GRUPO' => $evaluacion->grupo->ID_GRUPO,
                'ID_ETAPA' => $evaluacion->ID_ETAPA, // Asegúrate de incluir el ID_ETAPA aquí
                'grupoNombre' => $evaluacion->grupo->NOMBRE_GRUPO ?? 'Sin Grupo',
                'etapaNombre' => $evaluacion->etapa->ETAPAS_TITULO ?? 'Sin Etapa',
                'defensaDia' => $evaluacion->fecha_defensa->day ?? 'No asignado',
                'defensaHora' => $evaluacion->fecha_defensa
                    ? "{$evaluacion->fecha_defensa->HR_INIDEF} - {$evaluacion->fecha_defensa->HR_FINDEF}"
                    : 'No asignado',
                'PORTADA_GRUPO' => $evaluacion->grupo->PORTADA_GRUPO
                    ? url("storage/{$evaluacion->grupo->PORTADA_GRUPO}")
                    : null,
                'representanteLegal' => $representanteLegal ? [
                    'nombre' => $representanteLegal->NOMBRE_EST,
                    'apellido' => $representanteLegal->APELLIDO_EST,
                    'foto' => $representanteLegal->FOTO_EST
                        ? url("storage/{$representanteLegal->FOTO_EST}")
                        : null,
                ] : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener los detalles de la evaluación'], 500);
        }
    }

    // Actualizar una evaluación individual
    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'grupoId' => 'required|exists:grupo,ID_GRUPO',
            'etapaId' => 'required|exists:etapas,ID_ETAPA',
        ]);

        $evaluacion = EvaluacionIndividual::findOrFail($id);
        $evaluacion->update([
            'ID_GRUPO' => $validatedData['grupoId'],
            'ID_ETAPA' => $validatedData['etapaId'],
        ]);

        return response()->json($evaluacion);
    }

    // Eliminar una evaluación individual
    public function destroy($id)
    {
        $evaluacion = EvaluacionIndividual::findOrFail($id);
        $evaluacion->delete();

        return response()->json(['message' => 'Evaluación eliminada con éxito']);
    }
}