<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Etapa;
use Illuminate\Support\Facades\Log;

class EtapaController extends Controller
{
    // Método para obtener las etapas de un proyecto específico
    public function index($projectId)
    {
        try {
            $etapas = Etapa::where('ID_PROYECTO', $projectId)
                ->select('ID_ETAPA', 'ID_PROYECTO', 'ETAPAS_TITULO', 'ETAPAS_DESCRIPCION', 'ETAPAS_PUNTUACION', 'ETAPAS_DURACION')
                ->get();

            return response()->json($etapas);
        } catch (\Exception $e) {
            Log::error("Error al obtener las etapas: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener las etapas'], 500);
        }
    }


    // Método para crear una nueva etapa
    public function store(Request $request)
    {
        $request->validate([
            'id_proyecto' => 'required|string',
            'etapas_titulo' => 'required|string',
            'etapas_descripcion' => 'nullable|string',
            'etapas_puntuacion' => 'required|integer|min:0|max:100',
            'etapas_duracion' => 'required|integer|min:1',
        ]);

        try {
            $etapa = Etapa::create([
                'ID_PROYECTO' => $request->id_proyecto,
                'ETAPAS_TITULO' => $request->etapas_titulo,
                'ETAPAS_DESCRIPCION' => $request->etapas_descripcion,
                'ETAPAS_PUNTUACION' => $request->etapas_puntuacion,
                'ETAPAS_DURACION' => $request->etapas_duracion,
            ]);

            return response()->json(['etapa' => $etapa, 'message' => 'Etapa creada con éxito'], 201);
        } catch (\Exception $e) {
            Log::error("Error al crear la etapa: " . $e->getMessage());
            return response()->json(['error' => 'Error al crear la etapa'], 500);
        }
    }

    // Método para actualizar una etapa existente
    public function update(Request $request, $id)
    {
        $request->validate([
            'etapas_titulo' => 'required|string',
            'etapas_descripcion' => 'nullable|string',
            'etapas_puntuacion' => 'required|integer|min:0|max:100',
            'etapas_duracion' => 'required|integer|min:1',
        ]);

        try {
            $etapa = Etapa::findOrFail($id);
            $etapa->update([
                'ETAPAS_TITULO' => $request->etapas_titulo,
                'ETAPAS_DESCRIPCION' => $request->etapas_descripcion,
                'ETAPAS_PUNTUACION' => $request->etapas_puntuacion,
                'ETAPAS_DURACION' => $request->etapas_duracion,
            ]);

            return response()->json(['message' => 'Etapa actualizada con éxito'], 200);
        } catch (\Exception $e) {
            Log::error("Error al actualizar la etapa: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar la etapa'], 500);
        }
    }

    // Método para eliminar una etapa
    public function destroy($id)
    {
        try {
            $etapa = Etapa::findOrFail($id);
            $etapa->delete();

            return response()->json(['message' => 'Etapa eliminada con éxito'], 200);
        } catch (\Exception $e) {
            Log::error("Error al eliminar la etapa: " . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar la etapa'], 500);
        }
    }
    public function getEtapasByProyecto($projectId)
    {
        try {
            // Obtiene todas las etapas relacionadas con el ID del proyecto
            $etapas = Etapa::where('ID_PROYECTO', $projectId)->get();
            return response()->json($etapas, 200);
        } catch (\Exception $e) {
            Log::error("Error al obtener etapas: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener etapas'], 500);
        }
    }
    public function show($etapaId)
    {
        try {
            $etapa = Etapa::select('ID_ETAPA', 'ID_PROYECTO', 'ETAPAS_TITULO', 'ETAPAS_DESCRIPCION', 'ETAPAS_PUNTUACION', 'ETAPAS_DURACION')
                ->where('ID_ETAPA', $etapaId)
                ->first();

            if (!$etapa) {
                return response()->json(['error' => 'Etapa no encontrada'], 404);
            }

            return response()->json($etapa, 200);
        } catch (\Exception $e) {
            Log::error("Error al obtener la etapa: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener la etapa'], 500);
        }
    }
}
