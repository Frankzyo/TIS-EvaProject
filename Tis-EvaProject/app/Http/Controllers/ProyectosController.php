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
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $proyectos = Proyectos::where('ID_DOCENTE', $docenteId)->get();

        // Formatear fechas
        $proyectos = $proyectos->map(function ($proyecto) {
            $proyecto->FECHA_INICIO_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_INICIO_PROYECTO)->format('Y-m-d');
            $proyecto->FECHA_FIN_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_FIN_PROYECTO)->format('Y-m-d');
            return $proyecto;
        });

        return response()->json($proyectos)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }


    // Crear un nuevo proyecto
    public function store(Request $request)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'required|date|before_or_equal:FECHA_FIN_PROYECTO',
            'FECHA_FIN_PROYECTO' => 'required|date|after_or_equal:FECHA_INICIO_PROYECTO',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
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

        $proyecto->FECHA_INICIO_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_INICIO_PROYECTO)->format('Y-m-d');
        $proyecto->FECHA_FIN_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_FIN_PROYECTO)->format('Y-m-d');

        return response()->json($proyecto, 201);
    }



    // Actualizar un proyecto existente
    public function update(Request $request, $id)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $proyecto = Proyectos::where('ID_PROYECTO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado o no autorizado'], 404);
        }

        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'required|date|before_or_equal:FECHA_FIN_PROYECTO',
            'FECHA_FIN_PROYECTO' => 'required|date|after_or_equal:FECHA_INICIO_PROYECTO',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
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

        $proyecto->FECHA_INICIO_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_INICIO_PROYECTO)->format('Y-m-d');
        $proyecto->FECHA_FIN_PROYECTO = \Carbon\Carbon::parse($proyecto->FECHA_FIN_PROYECTO)->format('Y-m-d');

        return response()->json($proyecto);
    }

    // Eliminar un proyecto
    public function destroy($id)
    {
        Log::info("Intentando eliminar el proyecto con ID: " . $id);

        // Verificar si el usuario está autenticado como docente
        $docenteId = Auth::guard('docente')->id();

        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Buscar el proyecto correspondiente al docente
        $proyecto = Proyectos::where('ID_PROYECTO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        // Si no se encuentra el proyecto, responder con un error
        if (!$proyecto) {
            Log::info("Proyecto no encontrado o no autorizado con ID: " . $id);
            return response()->json(['message' => 'Proyecto no encontrado o no autorizado'], 404);
        }

        // Eliminar la portada del proyecto si existe en el almacenamiento
        if ($proyecto->PORTADA_PROYECTO && Storage::disk('public')->exists($proyecto->PORTADA_PROYECTO)) {
            Storage::disk('public')->delete($proyecto->PORTADA_PROYECTO);
            Log::info("Portada del proyecto eliminada correctamente.");
        }

        // Eliminar el proyecto
        $proyecto->delete();
        Log::info("Proyecto eliminado con éxito con ID: " . $id);

        return response()->json(['message' => 'Proyecto eliminado con éxito']);
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
    public function getProjectGroups($projectId)
    {
        try {
            // Obtener proyecto con sus grupos y fechas de defensa
            $proyecto = Proyectos::with(['grupos.fechasDefensa'])
                ->select('ID_PROYECTO', 'NOMBRE_PROYECTO', 'FECHA_INICIO_PROYECTO', 'FECHA_FIN_PROYECTO')
                ->findOrFail($projectId);

            return response()->json([
                'project' => [
                    'ID_PROYECTO' => $proyecto->ID_PROYECTO,
                    'NOMBRE_PROYECTO' => $proyecto->NOMBRE_PROYECTO,
                    'FECHA_INICIO' => $proyecto->FECHA_INICIO_PROYECTO,
                    'FECHA_FIN' => $proyecto->FECHA_FIN_PROYECTO,
                ],
                'groups' => $proyecto->grupos->map(function ($grupo) {
                    return [
                        'ID_GRUPO' => $grupo->ID_GRUPO,
                        'NOMBRE_GRUPO' => $grupo->NOMBRE_GRUPO,
                        'DESCRIP_GRUPO' => $grupo->DESCRIP_GRUPO,
                        'fechas_defensa' => $grupo->fechasDefensa->map(function ($fecha) {
                            return [
                                'ID_FECHADEF' => $fecha->ID_FECHADEF,
                                'DIA' => $fecha->day,
                                'HORA_INICIO' => $fecha->HR_INIDEF,
                                'HORA_FIN' => $fecha->HR_FINDEF,
                            ];
                        }),
                    ];
                }),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener los grupos y fechas de defensa del proyecto'], 500);
        }
    }

    public function obtenerGruposYFechas($id_proyecto)
    {
        try {
            $proyecto = Proyectos::with([
                'grupos.fechasDefensa',
                'etapas' => function ($query) {
                    $query->whereNotIn('ETAPAS_TITULO', ['ev cruz', 'auto ev']);
                }
            ])
                ->findOrFail($id_proyecto);


            return response()->json($proyecto, 200);
        } catch (\Exception $e) {
            Log::error("Error al obtener grupos y fechas de defensa: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener grupos y fechas de defensa'], 500);
        }
    }
}
