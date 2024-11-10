<?php

// app/Http/Controllers/GrupoController.php
namespace App\Http\Controllers;

use App\Models\Grupo;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;



class GrupoController extends Controller
{
    // Obtener los grupos de un proyecto específico
    public function index($projectId)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $grupos = Grupo::where('ID_PROYECTO', $projectId)->where('ID_DOCENTE', $docenteId)->get();
        return response()->json($grupos);
    }

    // Crear un nuevo grupo
    public function store(Request $request)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $request->validate([
            'NOMBRE_GRUPO' => 'required|max:255',
            'DESCRIP_GRUPO' => 'nullable|max:1000',
            'ID_PROYECTO' => 'required|exists:proyecto,ID_PROYECTO',
            'PORTADA_GRUPO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $imagePath = $request->hasFile('PORTADA_GRUPO')
            ? $request->file('PORTADA_GRUPO')->store('grupos', 'public')
            : null;

        $grupo = Grupo::create([
            'ID_GRUPO' => uniqid(),
            'NOMBRE_GRUPO' => $request->NOMBRE_GRUPO,
            'DESCRIP_GRUPO' => $request->DESCRIP_GRUPO,
            'ID_DOCENTE' => $docenteId,
            'ID_PROYECTO' => $request->ID_PROYECTO,
            'PORTADA_GRUPO' => $imagePath,
        ]);

        return response()->json($grupo, 201);
    }


    // Actualizar un grupo
    public function update(Request $request, $id)
    {
        Log::info('Datos recibidos para actualizar:', $request->all());
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $grupo = Grupo::where('ID_GRUPO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
        }

        $request->validate([
            'NOMBRE_GRUPO' => 'required|max:255',
            'DESCRIP_GRUPO' => 'nullable|max:1000',
            'PORTADA_GRUPO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('PORTADA_GRUPO')) {
            if ($grupo->PORTADA_GRUPO && Storage::disk('public')->exists($grupo->PORTADA_GRUPO)) {
                Storage::disk('public')->delete($grupo->PORTADA_GRUPO);
            }
            $imagePath = $request->file('PORTADA_GRUPO')->store('grupos', 'public');
        } else {
            $imagePath = $grupo->PORTADA_GRUPO;
        }

        $grupo->update([
            'NOMBRE_GRUPO' => $request->NOMBRE_GRUPO,
            'DESCRIP_GRUPO' => $request->DESCRIP_GRUPO,
            'PORTADA_GRUPO' => $imagePath,
        ]);

        return response()->json($grupo)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-CSRF-TOKEN');
    }

    // Eliminar un grupo
    public function destroy($id)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $grupo = Grupo::where('ID_GRUPO', $id)->where('ID_DOCENTE', $docenteId)->first();
        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        if ($grupo->PORTADA_GRUPO && Storage::disk('public')->exists($grupo->PORTADA_GRUPO)) {
            Storage::disk('public')->delete($grupo->PORTADA_GRUPO);
        }

        $grupo->delete();
        return response()->json(['message' => 'Grupo eliminado con éxito']);
    }
    // Mostrar los detalles de un grupo específico
    public function show($id)
    {
        $docenteId = Auth::guard('docente')->id();
        if (!$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $grupo = Grupo::where('ID_GRUPO', $id)
            ->where('ID_DOCENTE', $docenteId)
            ->first();

        if (!$grupo) {
            return response()->json(['message' => 'Grupo no encontrado o no autorizado'], 404);
        }

        return response()->json($grupo);
    }
}
