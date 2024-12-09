<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sprint;
use App\Models\HistoriaUsuario;
use Illuminate\Support\Facades\Log;

class SprintController extends Controller
{
    /**
     * Almacena un nuevo Sprint en la base de datos.
     */
    public function store(Request $request)
    {
        // Validar los datos recibidos
        $validatedData = $request->validate([
            'ID_GRUPO' => 'required|numeric|exists:grupo,ID_GRUPO', // Validar que el grupo exista
            'NOMBRE_SPRINT' => 'required|string|max:100',
            'FECHA_INICIO_SPRINT' => 'required|date',
            'FECHA_FIN_SPRINT' => 'required|date|after:FECHA_INICIO_SPRINT',
        ]);

        try {
            // Convertir ID_GRUPO a entero por si se envía como string
            $validatedData['ID_GRUPO'] = intval($validatedData['ID_GRUPO']);

            // Crear un nuevo Sprint
            $sprint = Sprint::create([
                'ID_SPRINT' => uniqid(), // Generar un ID único para el Sprint
                'ID_GRUPO' => $validatedData['ID_GRUPO'],
                'NOMBRE_SPRINT' => $validatedData['NOMBRE_SPRINT'],
                'FECHA_INICIO_SPRINT' => $validatedData['FECHA_INICIO_SPRINT'],
                'FECHA_FIN_SPRINT' => $validatedData['FECHA_FIN_SPRINT'],
            ]);

            return response()->json([
                'message' => 'Sprint creado exitosamente.',
                'sprint' => $sprint,
            ], 201);
        } catch (\Exception $e) {
            // Manejar errores inesperados
            Log::error('Error al crear el Sprint: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al crear el Sprint.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index($groupId)
    {
        try {
            // Obtén todos los sprints del grupo
            $sprints = Sprint::where('ID_GRUPO', $groupId)->get();

            // Devuelve los sprints como respuesta JSON
            return response()->json([
                'success' => true,
                'sprints' => $sprints
            ], 200);
        } catch (\Exception $e) {
            // Maneja errores
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los sprints: ' . $e->getMessage()
            ], 500);
        }
    }
    public function assignHistoria(Request $request, $sprintId)
    {
        $request->validate([
            'ID_HU' => 'required|exists:historias_usuario,ID_HU',
        ]);

        $sprint = Sprint::find($sprintId);

        if (!$sprint) {
            return response()->json(['error' => 'Sprint no encontrado'], 404);
        }

        $historia = HistoriaUsuario::find($request->ID_HU);
        $historia->ID_SPRINT = $sprint->ID_SPRINT;
        $historia->save();

        return response()->json(['message' => 'Historia asignada al Sprint', 'historia' => $historia]);
    }

    /**
     * Eliminar un sprint y desasociar las historias.
     */
    public function destroy($sprintId)
    {
        $sprint = Sprint::find($sprintId);

        if (!$sprint) {
            return response()->json(['error' => 'Sprint no encontrado'], 404);
        }

        // Desasociar las historias del sprint
        HistoriaUsuario::where('ID_SPRINT', $sprint->ID_SPRINT)->update(['ID_SPRINT' => null]);

        $sprint->delete();

        return response()->json(['message' => 'Sprint eliminado exitosamente']);
    }
}
