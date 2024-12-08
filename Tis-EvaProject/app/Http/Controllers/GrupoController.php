<?php

// app/Http/Controllers/GrupoController.php

namespace App\Http\Controllers;

use App\Models\Grupo;
use App\Models\GrupoEstudiante;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class GrupoController extends Controller
{
    // Obtener los grupos de un proyecto específico
    // app/Http/Controllers/GrupoController.php

    public function index($projectId)
    {
        // Verificar si es un estudiante autenticado
        $estudianteId = Auth::guard('estudiante')->id();
        $docenteId = Auth::guard('docente')->id();

        // Si no es ni estudiante ni docente, denegar acceso
        if (!$estudianteId && !$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Obtener los grupos del proyecto
        $grupos = Grupo::where('ID_PROYECTO', $projectId)
            ->get(['ID_GRUPO', 'NOMBRE_GRUPO', 'DESCRIP_GRUPO', 'PORTADA_GRUPO', 'CREADO_POR']);

        // Solo si es un estudiante, buscar el grupo creado por él
        $studentGroupId = null;
        if ($estudianteId) {
            $studentGroup = Grupo::where('ID_PROYECTO', $projectId)
                ->where('CREADO_POR', $estudianteId)
                ->first();
            $studentGroupId = optional($studentGroup)->ID_GRUPO;
        }

        return response()->json([
            'grupos' => $grupos,
            'studentGroupId' => $studentGroupId,
        ]);
    }


    // Crear un nuevo grupo
    public function store(Request $request)
    {
        // Verificar si el usuario está autenticado como estudiante
        $estudianteId = Auth::guard('estudiante')->id();

        if (!$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Validar los datos de entrada
        $request->validate([
            'NOMBRE_GRUPO' => 'required|max:255',
            'DESCRIP_GRUPO' => 'nullable|max:1000',
            'ID_PROYECTO' => 'required|exists:proyecto,ID_PROYECTO',
            'PORTADA_GRUPO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // Verificar si el nombre del grupo ya existe en el proyecto
        $existingGroup = Grupo::where('NOMBRE_GRUPO', $request->NOMBRE_GRUPO)
            ->where('ID_PROYECTO', $request->ID_PROYECTO)
            ->first();

        if ($existingGroup) {
            return response()->json([
                'message' => 'El nombre del grupo ya existe en este proyecto. Por favor, elija otro nombre.',
            ], 422);
        }

        // Manejar la imagen
        $imagePath = $request->hasFile('PORTADA_GRUPO')
            ? $request->file('PORTADA_GRUPO')->store('grupos', 'public')
            : null;

        // Crear el grupo con los datos proporcionados
        $grupo = Grupo::create([
            'NOMBRE_GRUPO' => $request->NOMBRE_GRUPO,
            'DESCRIP_GRUPO' => $request->DESCRIP_GRUPO,
            'ID_PROYECTO' => $request->ID_PROYECTO,
            'PORTADA_GRUPO' => $imagePath,
            'CREADO_POR' => $estudianteId, // Estudiante que crea el grupo
        ]);

        // Log para verificar que el grupo se creó
        Log::info('Grupo creado exitosamente:', $grupo->toArray());

        // Retornar el grupo completo, incluyendo `ID_GRUPO`
        return response()->json($grupo, 201);
    }

    // Actualizar un grupo
    // Actualizar un grupo
    public function update(Request $request, $id)
    {
        Log::info('Datos recibidos para actualizar:', $request->all());

        // Obtener los IDs de los usuarios autenticados
        $docenteId = Auth::guard('docente')->id();
        $estudianteId = Auth::guard('estudiante')->id();

        if (!$docenteId && !$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Obtener el grupo y limitar el acceso según el usuario
        $query = Grupo::where('ID_GRUPO', $id);
        if ($docenteId) {
            $query->where('ID_DOCENTE', $docenteId);
        } elseif ($estudianteId) {
            $query->where('CREADO_POR', $estudianteId);
        }

        $grupo = $query->first();
        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        // Validar los datos de entrada
        try {
            $validatedData = $request->validate([
                'NOMBRE_GRUPO' => 'required|max:255',
                'DESCRIP_GRUPO' => 'nullable|max:1000',
                'PORTADA_GRUPO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', $e->errors());
            return response()->json(['message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        }

        // Verificar si el nuevo nombre ya existe en otro grupo del mismo proyecto
        $existingGroup = Grupo::where('NOMBRE_GRUPO', $validatedData['NOMBRE_GRUPO'])
            ->where('ID_PROYECTO', $grupo->ID_PROYECTO)
            ->where('ID_GRUPO', '!=', $id) // Excluir el grupo actual
            ->first();

        if ($existingGroup) {
            return response()->json([
                'message' => 'El nombre del grupo ya existe en este proyecto. Por favor, elija otro nombre.',
            ], 422);
        }

        // Manejar la imagen si se proporciona una nueva
        $imagePath = $grupo->PORTADA_GRUPO;
        if ($request->hasFile('PORTADA_GRUPO')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('PORTADA_GRUPO')->store('grupos', 'public');
        }

        // Actualizar el grupo con los nuevos datos
        $grupo->update([
            'NOMBRE_GRUPO' => $validatedData['NOMBRE_GRUPO'],
            'DESCRIP_GRUPO' => $validatedData['DESCRIP_GRUPO'],
            'PORTADA_GRUPO' => $imagePath,
        ]);

        return response()->json($grupo);
    }


    // Eliminar un grupo
    public function destroy($id)
    {
        $docenteId = Auth::guard('docente')->id();
        $estudianteId = Auth::guard('estudiante')->id();

        if (!$docenteId && !$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $query = Grupo::where('ID_GRUPO', $id);

        if ($docenteId) {
            $query->where('ID_DOCENTE', $docenteId);
        } elseif ($estudianteId) {
            $query->where('CREADO_POR', $estudianteId); // Limitar a grupos creados por el estudiante
        }

        $grupo = $query->first();

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        if ($grupo->PORTADA_GRUPO && Storage::disk('public')->exists($grupo->PORTADA_GRUPO)) {
            Storage::disk('public')->delete($grupo->PORTADA_GRUPO);
        }

        $grupo->delete();
        return response()->json(['message' => 'Grupo eliminado con éxito']);
    }
    public function registerStudentInGroup(Request $request, $groupId)
    {
        try {
            $estudianteId = Auth::guard('estudiante')->id();

            if (!$estudianteId) {
                return response()->json(['message' => 'No autorizado'], 401);
            }

            // Verificar si el estudiante ya está registrado en un grupo
            $existingRecord = GrupoEstudiante::where('ID_ESTUDIANTE', $estudianteId)->first();

            if ($existingRecord) {
                return response()->json(['message' => 'Ya estás registrado en un grupo'], 409);
            }

            // Crear el registro en la tabla GRUPO_ESTUDIANTE
            GrupoEstudiante::create([
                'ID_GRUPO' => $groupId,
                'ID_ESTUDIANTE' => $estudianteId,
            ]);

            // Actualizar el campo ID_GRUPO en la tabla ESTUDIANTE
            $estudiante = Estudiante::find($estudianteId);
            $estudiante->ID_GRUPO = $groupId;
            $estudiante->save();

            return response()->json(['message' => 'Registrado con éxito', 'groupId' => $groupId], 200);
        } catch (\Exception $e) {
            Log::error('Error en registerStudentInGroup: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno del servidor'], 500);
        }
    }

    public function show($id)
    {
        $docenteId = Auth::guard('docente')->id();
        $estudianteId = Auth::guard('estudiante')->id();

        // Si no es ni docente ni estudiante, denegar acceso
        if (!$docenteId && !$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Configurar la consulta inicial
        $query = Grupo::where('ID_GRUPO', $id);

        // Eliminar la restricción para los estudiantes que no crearon el grupo
        // Esto permitirá que cualquier estudiante pueda ver el grupo sin importar quién lo creó

        // Obtener el grupo sin la restricción de CREADO_POR para estudiantes
        $grupo = $query->first();

        // Verificar si se encontró el grupo
        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        // Retornar la información del grupo
        return response()->json($grupo);
    }
    public function getStudentRegistrationStatus($studentId)
    {
        $registro = GrupoEstudiante::where('ID_ESTUDIANTE', $studentId)->first();

        return response()->json([
            'isRegistered' => $registro !== null,
            'groupId' => $registro ? $registro->ID_GRUPO : null,
        ]);
    }
}
