<?php

namespace App\Http\Controllers;

use Exception;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\FechaDefensa;
use App\Models\GrupoEstudiante;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FechaDefensaController extends Controller
{
    // Método para crear una nueva fecha de defensa
    public function store(Request $request): JsonResponse
    {
        // Validar los datos de entrada
        $validated = $request->validate([
            'day' => 'required|string',
            'startTime' => 'required|date_format:H:i',
            'endTime' => 'required|date_format:H:i',
            'ID_PROYECTO' => 'required|string'
        ]);

        // Convertir las horas de inicio y fin a objetos de Carbon
        $startTime = Carbon::createFromFormat('H:i', $validated['startTime']);
        $endTime = Carbon::createFromFormat('H:i', $validated['endTime']);

        // Calcular la diferencia en minutos
        $duration = $startTime->diffInMinutes($endTime);

        // Verificar que el rango no exceda 90 minutos (1 hora y 30 minutos)
        if ($duration > 90) {
            return response()->json(['error' => 'La duración no puede exceder 1 hora y 30 minutos.'], 422);
        }

        // Verificar si ya existe una fecha de defensa en el mismo día y horario que se solapen
        $existingDefenseDay = FechaDefensa::where('day', $validated['day'])
            ->where('ID_PROYECTO', $validated['ID_PROYECTO'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($query) use ($startTime, $endTime) {
                    // Ajuste para permitir que los horarios sean adyacentes
                    $query->where('HR_INIDEF', '<', $endTime->format('H:i'))
                        ->where('HR_FINDEF', '>', $startTime->format('H:i'));
                });
            })
            ->first();

        if ($existingDefenseDay) {
            return response()->json(['error' => 'Ya existe una fecha de defensa programada que se solapa con el horario seleccionado.'], 422);
        }

        // Guardar la fecha de defensa si la validación es exitosa
        try {
            $fechaDefensa = new FechaDefensa();
            $fechaDefensa->day = $validated['day'];
            $fechaDefensa->HR_INIDEF = $startTime->format('H:i');
            $fechaDefensa->HR_FINDEF = $endTime->format('H:i');
            $fechaDefensa->ID_PROYECTO = $validated['ID_PROYECTO'];
            $fechaDefensa->save();

            return response()->json([
                'fechaDefensa' => [
                    'ID_FECHADEF' => $fechaDefensa->ID_FECHADEF,
                    'day' => $fechaDefensa->day,
                    'startTime' => $fechaDefensa->HR_INIDEF,
                    'endTime' => $fechaDefensa->HR_FINDEF,
                ],
                'message' => 'Fecha de defensa creada exitosamente.'
            ], 200);
        } catch (Exception $e) {
            Log::error("Error al guardar la fecha de defensa: " . $e->getMessage());
            return response()->json(['error' => 'Error al guardar la fecha de defensa.'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validar los datos entrantes
        $request->validate([
            'day' => 'required|string',
            'startTime' => 'required', // Eliminamos la validación de formato aquí
            'endTime' => 'required',   // Eliminamos la validación de formato aquí
            'ID_PROYECTO' => 'required|string',
        ]);

        try {
            // Buscar el registro de fecha de defensa por su ID
            $fechaDefensa = FechaDefensa::findOrFail($id);

            // Función auxiliar para formatear el tiempo a H:i, aceptando H:i o H:i:s
            $formatTime = function ($time) {
                try {
                    return \Carbon\Carbon::createFromFormat('H:i', $time)->format('H:i');
                } catch (\Exception $e) {
                    return \Carbon\Carbon::createFromFormat('H:i:s', $time)->format('H:i');
                }
            };

            // Convertir startTime y endTime al formato H:i
            $startTime = $formatTime($request->startTime);
            $endTime = $formatTime($request->endTime);

            // Actualizar los campos con los datos del request
            $fechaDefensa->day = $request->day;
            $fechaDefensa->HR_INIDEF = $startTime;
            $fechaDefensa->HR_FINDEF = $endTime;
            $fechaDefensa->ID_PROYECTO = $request->ID_PROYECTO;

            // Guardar los cambios
            $fechaDefensa->save();

            return response()->json(['message' => 'Fecha de defensa actualizada con éxito']);
        } catch (\Exception $e) {
            Log::error("Error al actualizar la fecha de defensa: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar la fecha de defensa'], 500);
        }
    }

    // Método para asignar un grupo a una fecha de defensa
    // En FechaDefensaController.php
    public function registerToDefense($defenseId)
    {
        try {
            $estudianteId = Auth::id();

            // Obtener el grupo del estudiante
            $grupoId = DB::table('estudiante')->where('ID_EST', $estudianteId)->value('ID_GRUPO');

            if (!$grupoId) {
                return response()->json(['error' => 'No se encontró el grupo del estudiante'], 404);
            }

            // Verificar si ya hay un grupo registrado en esta fecha
            $existingGroup = FechaDefensa::where('ID_FECHADEF', $defenseId)
                ->whereNotNull('ID_GRUPO')
                ->exists();

            if ($existingGroup) {
                return response()->json(['error' => 'Esta fecha de defensa ya está ocupada por otro grupo'], 409);
            }

            // Registrar el grupo en la fecha de defensa
            DB::table('fechas_defensa')
                ->where('ID_FECHADEF', $defenseId)
                ->update(['ID_GRUPO' => $grupoId]);

            return response()->json(['message' => 'Registro exitoso en la defensa'], 200);
        } catch (Exception $e) {
            Log::error("Error al registrar en la defensa: " . $e->getMessage());
            return response()->json(['error' => 'Error al registrar en la defensa: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Encuentra la fecha de defensa por su ID
            $fechaDefensa = FechaDefensa::findOrFail($id);

            // Elimina la fecha de defensa
            $fechaDefensa->delete();

            // Retorna una respuesta exitosa
            return response()->json(['message' => 'Fecha de defensa eliminada correctamente'], 200);
        } catch (Exception $e) {
            // Maneja cualquier error y retorna una respuesta de error
            return response()->json(['error' => 'Error al eliminar la fecha de defensa'], 500);
        }
    }
    public function getFechasByProject($projectId, $studentId)
    {
        // Obtener el grupo del estudiante
        $grupo = GrupoEstudiante::where('ID_ESTUDIANTE', $studentId)->first();
        $grupoId = $grupo ? $grupo->ID_GRUPO : null;

        // Obtener las fechas de defensa del proyecto
        $fechasDefensa = FechaDefensa::where('ID_PROYECTO', $projectId)
            ->get()
            ->map(function ($fecha) use ($grupoId) {
                return [
                    'ID_FECHADEF' => $fecha->ID_FECHADEF,
                    'day' => $fecha->day,
                    'HR_INIDEF' => $fecha->HR_INIDEF,
                    'HR_FINDEF' => $fecha->HR_FINDEF,
                    'ID_GRUPO' => $fecha->ID_GRUPO,
                    'status' => $fecha->ID_GRUPO
                        ? ($fecha->ID_GRUPO == $grupoId ? 'Registrado' : 'Reservado')
                        : 'Disponible'
                ];
            });

        return response()->json($fechasDefensa, 200);
    }
    public function getFechasByProjectForDocente($projectId)
    {
        $fechasDefensa = FechaDefensa::where('ID_PROYECTO', $projectId)
            ->with('grupo') // Esto traerá la información del grupo asociado
            ->get()
            ->map(function ($fecha) {
                return [
                    'ID_FECHADEF' => $fecha->ID_FECHADEF,
                    'day' => $fecha->day,
                    'HR_INIDEF' => $fecha->HR_INIDEF,
                    'HR_FINDEF' => $fecha->HR_FINDEF,
                    'ID_GRUPO' => $fecha->ID_GRUPO,
                    'NOMBRE_GRUPO' => $fecha->grupo ? $fecha->grupo->NOMBRE_GRUPO : null,
                    'status' => $fecha->ID_GRUPO ? 'Reservado' : 'Disponible'
                ];
            });

        return response()->json($fechasDefensa, 200);
    }

    public function getAvailableDefenseDates($projectId)
    {
        $defenseDates = DB::table('fechas_defensa')
            ->where('ID_PROYECTO', $projectId)
            ->whereNull('ID_GRUPO') // Mostrar solo fechas sin grupo asignado
            ->get();

        return response()->json($defenseDates);
    }

    // Método para listar todas las fechas de defensa
    public function index()
    {
        $fechasDefensa = FechaDefensa::all();
        return response()->json($fechasDefensa);
    }
    public function getGroupDefenseRegistrationStatus($studentId)
    {
        // Obtener el grupo del estudiante
        $grupo = GrupoEstudiante::where('ID_ESTUDIANTE', $studentId)->first();

        if (!$grupo) {
            return response()->json(['isRegisteredFech' => []]);
        }

        // Buscar todas las fechas donde el ID_GRUPO del estudiante está registrado
        $defensaRegistros = FechaDefensa::where('ID_GRUPO', $grupo->ID_GRUPO)->get();

        // Crear un array para almacenar el estado de registro en cada fecha
        $isRegisteredFech = [];
        foreach ($defensaRegistros as $registro) {
            $isRegisteredFech[$registro->ID_FECHADEF] = true;
        }

        return response()->json([
            'isRegisteredFech' => $isRegisteredFech,
        ]);
    }
}
