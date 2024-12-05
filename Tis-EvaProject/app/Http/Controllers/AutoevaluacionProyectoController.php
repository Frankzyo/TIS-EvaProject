<?php

namespace App\Http\Controllers;

use App\Models\AutoevaluacionProyecto;
use App\Models\PreguntaAutoevaluacion;
use App\Models\OpcionPreguntaAutoevaluacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AutoevaluacionProyectoController extends Controller
{
    public function store(Request $request, $projectId)
    {
        Log::info('Datos recibidos para guardar:', $request->all());
        $validated = $request->validate([
            'TITULO_AUTOEVAL' => 'required|string|max:255',
            'DESCRIPCION_AUTOEVAL' => 'nullable|string',
            'FECHA_INICIO_AUTOEVAL' => 'required|date',
            'FECHA_FIN_AUTOEVAL' => 'required|date|after_or_equal:FECHA_INICIO_AUTOEVAL',
            'autoevaluaciones' => 'required|array',
        ]);
        Log::info('Datos validados:', $validated);
        $autoevaluacion = AutoevaluacionProyecto::create([
            'ID_PROYECTO' => $projectId,
            'TITULO_AUTOEVAL' => $validated['TITULO_AUTOEVAL'],
            'DESCRIPCION_AUTOEVAL' => $validated['DESCRIPCION_AUTOEVAL'],
            'FECHA_INICIO_AUTOEVAL' => $validated['FECHA_INICIO_AUTOEVAL'],
            'FECHA_FIN_AUTOEVAL' => $validated['FECHA_FIN_AUTOEVAL'],
        ]);

        foreach ($validated['autoevaluaciones'] as $pregunta) {
            $preguntaModel = PreguntaAutoevaluacion::create([
                'ID_AUTOEVAL_PROYECTO' => $autoevaluacion->ID_AUTOEVAL_PROYECTO,
                'PREGUNTA_AUTOEVAL' => $pregunta['pregunta'],
            ]);

            foreach ($pregunta['opciones'] as $opcion) {
                OpcionPreguntaAutoevaluacion::create([
                    'ID_PREGUNTA_AUTOEVAL' => $preguntaModel->ID_PREGUNTA_AUTOEVAL,
                    'TEXTO_OPCION_AUTOEVAL' => $opcion['texto'],
                    'PUNTUACION_OPCION_AUTOEVAL' => $opcion['puntuacion'],
                ]);
            }
        }

        return response()->json(['message' => 'Autoevaluación creada con éxito'], 201);
    }


    public function show($projectId)
    {
        $autoevaluaciones = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->with('preguntas.opciones')
            ->get();

        return response()->json($autoevaluaciones);
    }
    public function update(Request $request, $projectId, $autoevaluacionId)
    {
        $validated = $request->validate([
            'TITULO_AUTOEVAL' => 'required|string|max:255',
            'DESCRIPCION_AUTOEVAL' => 'nullable|string',
            'FECHA_INICIO_AUTOEVAL' => 'required|date',
            'FECHA_FIN_AUTOEVAL' => 'required|date|after_or_equal:FECHA_INICIO_AUTOEVAL',
            'autoevaluaciones' => 'required|array',
        ]);

        // Buscar la autoevaluación por ID y proyecto asociado
        $autoevaluacion = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->where('ID_AUTOEVAL_PROYECTO', $autoevaluacionId)
            ->firstOrFail();

        // Actualizar los datos de la autoevaluación
        $autoevaluacion->update([
            'TITULO_AUTOEVAL' => $validated['TITULO_AUTOEVAL'],
            'DESCRIPCION_AUTOEVAL' => $validated['DESCRIPCION_AUTOEVAL'],
            'FECHA_INICIO_AUTOEVAL' => $validated['FECHA_INICIO_AUTOEVAL'],
            'FECHA_FIN_AUTOEVAL' => $validated['FECHA_FIN_AUTOEVAL'],
        ]);

        // Actualizar preguntas y opciones
        foreach ($validated['autoevaluaciones'] as $preguntaData) {
            // Buscar o crear la pregunta
            $pregunta = PreguntaAutoevaluacion::updateOrCreate(
                [
                    'ID_AUTOEVAL_PROYECTO' => $autoevaluacion->ID_AUTOEVAL_PROYECTO,
                    'PREGUNTA_AUTOEVAL' => $preguntaData['pregunta'],
                ]
            );

            foreach ($preguntaData['opciones'] as $opcionData) {
                // Buscar o crear la opción
                OpcionPreguntaAutoevaluacion::updateOrCreate(
                    [
                        'ID_PREGUNTA_AUTOEVAL' => $pregunta->ID_PREGUNTA_AUTOEVAL,
                        'TEXTO_OPCION_AUTOEVAL' => $opcionData['texto'],
                    ],
                    [
                        'PUNTUACION_OPCION_AUTOEVAL' => $opcionData['puntuacion'],
                    ]
                );
            }
        }

        return response()->json(['message' => 'Autoevaluación actualizada con éxito'], 200);
    }
    public function destroy($projectId, $autoevaluacionId)
    {
        // Buscar la autoevaluación
        $autoevaluacion = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->where('ID_AUTOEVAL_PROYECTO', $autoevaluacionId)
            ->firstOrFail();

        // Eliminar la autoevaluación (esto elimina preguntas y opciones gracias a las relaciones)
        $autoevaluacion->delete();

        return response()->json(['message' => 'Autoevaluación eliminada con éxito'], 200);
    }
    public function destroyPregunta($preguntaId)
    {
        $pregunta = PreguntaAutoevaluacion::findOrFail($preguntaId);
        $pregunta->delete(); // Esto elimina automáticamente sus opciones

        return response()->json(['message' => 'Pregunta eliminada con éxito'], 200);
    }
    public function destroyOpcion($opcionId)
    {
        $opcion = OpcionPreguntaAutoevaluacion::findOrFail($opcionId);
        $opcion->delete();

        return response()->json(['message' => 'Opción eliminada con éxito'], 200);
    }
}
