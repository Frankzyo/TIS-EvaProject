<?php

namespace App\Http\Controllers;

use App\Models\Proyectos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

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

        if ($proyecto->PORTADA_PROYECTO && Storage::disk('public')->exists($proyecto->PORTADA_PROYECTO)) {
            Storage::disk('public')->delete($proyecto->PORTADA_PROYECTO);
        }

        $proyecto->delete();

        return response()->json(['message' => 'Proyecto eliminado con éxito'])
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }
    // Obtener un proyecto específico
    public function show($id)
    {
        // Verificar si el usuario está autenticado
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        // Buscar el proyecto por ID y verificar que pertenece al docente autenticado
        $proyecto = Proyectos::where('ID_PROYECTO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        if ($proyecto) {
            return response()->json($proyecto)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        } else {
            return response()->json(['message' => 'Proyecto no encontrado o no autorizado'], 404)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }
    }
}
