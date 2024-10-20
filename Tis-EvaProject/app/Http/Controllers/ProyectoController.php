<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Importa la clase Storage

class ProyectoController extends Controller
{
    // Mostrar todos los proyectos
    public function index()
    {
        $proyectos = Proyecto::all();
        return response()->json($proyectos);
    }

    // Crear un nuevo proyecto
    public function store(Request $request)
    {
        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'nullable|date',
            'FECHA_FIN_PROYECTO' => 'nullable|date',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        // Guardar la imagen si está presente
        $imagePath = $request->hasFile('PORTADA_PROYECTO') 
            ? $request->file('PORTADA_PROYECTO')->store('proyectos', 'public')
            : null;

        $proyecto = Proyecto::create([
            'ID_PROYECTO' => uniqid(),
            'NOMBRE_PROYECTO' => $request->NOMBRE_PROYECTO,
            'DESCRIP_PROYECTO' => $request->DESCRIP_PROYECTO,
            'FECHA_INICIO_PROYECTO' => $request->FECHA_INICIO_PROYECTO,
            'FECHA_FIN_PROYECTO' => $request->FECHA_FIN_PROYECTO,
            'PORTADA_PROYECTO' => $imagePath,
        ]);

        return response()->json($proyecto, 201);
    }

    // Actualizar un proyecto existente
    public function update(Request $request, $id)
    {
        $proyecto = Proyecto::find($id);

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado'], 404);
        }

        $request->validate([
            'NOMBRE_PROYECTO' => 'required|max:1000',
            'DESCRIP_PROYECTO' => 'nullable|max:1000',
            'FECHA_INICIO_PROYECTO' => 'nullable|date',
            'FECHA_FIN_PROYECTO' => 'nullable|date',
            'PORTADA_PROYECTO' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('PORTADA_PROYECTO')) {
            // Elimina la imagen anterior si existe
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

        return response()->json($proyecto);
    }

    // Eliminar un proyecto
    public function destroy($id)
    {
        $proyecto = Proyecto::find($id);

        if (!$proyecto) {
            return response()->json(['message' => 'Proyecto no encontrado'], 404);
        }

        if ($proyecto->PORTADA_PROYECTO && Storage::disk('public')->exists($proyecto->PORTADA_PROYECTO)) {
            Storage::disk('public')->delete($proyecto->PORTADA_PROYECTO);
        }

        $proyecto->delete();

        return response()->json(['message' => 'Proyecto eliminado con éxito']);
    }
}
