<?php

namespace App\Http\Controllers;

use App\Models\Proyectos;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Grupo;

class ProyectosController extends Controller
{
    // Mostrar todos los proyectos
    public function index()
    {
        // Verificar si el usuario está autenticado
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $proyectos = Proyectos::where('ID_DOCENTE', $docenteId)->get();

        return response()->json($proyectos)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }

    // Crear un nuevo proyecto
    public function store(Request $request)
    {
        // Verificar si el usuario está autenticado
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'nullable|date',
            'FECHA_FIN_PROYECTO' => 'nullable|date',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $imagePath = $request->hasFile('PORTADA_PROYECTO')
            ? $request->file('PORTADA_PROYECTO')->store('proyectos', 'public')
            : null;

        $proyecto = Proyectos::create([
            'ID_PROYECTO' => uniqid(),
            'NOMBRE_PROYECTO' => $request->NOMBRE_PROYECTO,
            'DESCRIP_PROYECTO' => $request->DESCRIP_PROYECTO,
            'FECHA_INICIO_PROYECTO' => $request->FECHA_INICIO_PROYECTO,
            'FECHA_FIN_PROYECTO' => $request->FECHA_FIN_PROYECTO,
            'PORTADA_PROYECTO' => $imagePath,
            'ID_DOCENTE' => $docenteId,
        ]);

        return response()->json($proyecto, 201)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }

    // Actualizar un proyecto existente
    public function update(Request $request, $id)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $proyecto = Proyectos::where('ID_PROYECTO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado o no autorizado'], 404)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'nullable|date',
            'FECHA_FIN_PROYECTO' => 'nullable|date',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('PORTADA_PROYECTO')) {
            if ($proyecto->PORTADA_PROYECTO && Storage::disk('public')->exists($proyecto->PORTADA_PROYECTO)) {
                Storage::disk('public')->delete($proyecto->PORTADA_PROYECTO);
            }
            $imagePath = $request->file('PORTADA_PROYECTO')->store('proyectos', 'public');
        } else {
            $imagePath = $proyecto->PORTADA_PROYECTO;
        }

        $proyecto->update([
            'NOMBRE_PROYECTO' => $request->NOMBRE_PROYECTO,
            'DESCRIP_PROYECTO' => $request->DESCRIP_PROYECTO,
            'FECHA_INICIO_PROYECTO' => $request->FECHA_INICIO_PROYECTO,
            'FECHA_FIN_PROYECTO' => $request->FECHA_FIN_PROYECTO,
            'PORTADA_PROYECTO' => $imagePath,
        ]);

        return response()->json($proyecto)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }

    // Eliminar un proyecto
    public function destroy($id)
    {
        Log::info("Intentando eliminar el grupo con ID: " . $id);

        // Verificar si el usuario está autenticado como docente o estudiante
        $docenteId = Auth::guard('docente')->id();
        $estudianteId = Auth::guard('estudiante')->id();

        // Si no hay un usuario autenticado, responder con un error de autorización
        if (!$docenteId && !$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Construir la consulta para obtener el grupo
        $query = Grupo::where('ID_GRUPO', $id);

        // Si el usuario es docente, filtrar por su ID_DOCENTE
        if ($docenteId) {
            $query->where('ID_DOCENTE', $docenteId);
        }
        // Nota: Si el usuario es un estudiante, no aplicamos el filtro de ID_DOCENTE.

        $grupo = $query->first();

        // Si no se encuentra el grupo, responder con un error
        if (!$grupo) {
            Log::info("Grupo no encontrado o no autorizado con ID: " . $id);
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        // Eliminar la portada del grupo si existe en el almacenamiento
        if ($grupo->PORTADA_GRUPO && Storage::disk('public')->exists($grupo->PORTADA_GRUPO)) {
            Storage::disk('public')->delete($grupo->PORTADA_GRUPO);
        }

        // Eliminar el grupo
        $grupo->delete();
        Log::info("Grupo eliminado con éxito con ID: " . $id);

        return response()->json(['message' => 'Grupo eliminado con éxito']);
    }

    // Obtener un proyecto específico
    public function show($id)
    {
        $docenteId = Auth::guard('docente')->id();
        $estudianteId = Auth::guard('estudiante')->id();

        if (!$docenteId && !$estudianteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $query = Proyectos::where('ID_PROYECTO', $id);

        // Si es docente, filtra por el ID_DOCENTE
        if ($docenteId) {
            $query->where('ID_DOCENTE', $docenteId);
        }

        // Si es estudiante, filtra por el ID_PROYECTO del estudiante
        if ($estudianteId) {
            $estudiante = Estudiante::find($estudianteId);
            if ($estudiante && $estudiante->ID_PROYECTO != $id) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
        }

        $proyecto = $query->first();

        if ($proyecto) {
            return response()->json($proyecto);
        } else {
            return response()->json(['message' => 'Proyecto no encontrado o no autorizado'], 404);
        }
    }

    // Mostrar todos los proyectos sin restricciones de docente
    public function indexAll()
    {
        try {
            // Obtener todos los proyectos junto con el nombre y apellido del docente
            $proyectos = Proyectos::with('docente:ID_DOCENTE,NOMBRE_DOCENTE,APELLIDO_DOCENTE')
                ->get(['ID_PROYECTO', 'NOMBRE_PROYECTO', 'DESCRIP_PROYECTO', 'PORTADA_PROYECTO', 'ID_DOCENTE']);

            return response()->json($proyectos)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        } catch (\Exception $e) {
            Log::error('Error al obtener los proyectos: ' . $e->getMessage());
            return response()->json(['error' => 'Error al obtener los proyectos'], 500);
        }
    }
    public function obtenerGruposYFechas($id_proyecto)
    {
        try {
            $proyecto = Proyectos::with(['grupos.fechasDefensa', 'etapas'])
                ->findOrFail($id_proyecto);

            return response()->json($proyecto, 200);
        } catch (\Exception $e) {
            Log::error("Error al obtener grupos, fechas de defensa y etapas: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener grupos, fechas de defensa y etapas'], 500);
        }
    }
}
