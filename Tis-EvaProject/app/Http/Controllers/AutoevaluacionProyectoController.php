<?php

namespace App\Http\Controllers;

use App\Models\AutoevaluacionProyecto;
use App\Models\PreguntaAutoevaluacion;
use App\Models\OpcionPreguntaAutoevaluacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AutoevaluacionProyectoController extends Controller
{
    public function store(Request $request, $projectId)
{
    Log::info('Datos recibidos para guardar:', $request->all());

    // Validación de los datos
    try {
        $validated = $request->validate([
            'TITULO_AUTOEVAL' => 'required|string|max:255',
            'DESCRIPCION_AUTOEVAL' => 'nullable|string',
            'FECHA_INICIO_AUTOEVAL' => 'required|date',
            'FECHA_FIN_AUTOEVAL' => 'required|date|after_or_equal:FECHA_INICIO_AUTOEVAL',
            'PUNTUACION_TOTAL_AUTOEVAL' => 'required|numeric|min:0', // Validación añadida
            'autoevaluaciones' => 'required|array|min:1',
            'autoevaluaciones.*.pregunta' => 'required|string|max:255',
            'autoevaluaciones.*.opciones' => 'required|array|min:1',
            'autoevaluaciones.*.opciones.*.texto' => 'required|string|max:255',
            'autoevaluaciones.*.opciones.*.puntuacion' => 'required|numeric|min:0',
        ]);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        Log::error('Errores de validación:', $e->errors());
        return response()->json(['errors' => $e->errors()], 422);
    }

    // Usar transacción para garantizar atomicidad
    try {
        DB::transaction(function () use ($projectId, $validated) {
            // Crear la autoevaluación
            $autoevaluacion = AutoevaluacionProyecto::create([
                'ID_PROYECTO' => $projectId,
                'TITULO_AUTOEVAL' => $validated['TITULO_AUTOEVAL'],
                'DESCRIPCION_AUTOEVAL' => $validated['DESCRIPCION_AUTOEVAL'],
                'FECHA_INICIO_AUTOEVAL' => $validated['FECHA_INICIO_AUTOEVAL'],
                'FECHA_FIN_AUTOEVAL' => $validated['FECHA_FIN_AUTOEVAL'],
                'PUNTUACION_TOTAL_AUTOEVAL' => $validated['PUNTUACION_TOTAL_AUTOEVAL'],
            ]);

            Log::info('ID_AUTOEVAL_PROYECTO generado:', ['ID_AUTOEVAL_PROYECTO' => $autoevaluacion->ID_AUTOEVAL_PROYECTO]);

            // Crear preguntas y opciones
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
        });

        return response()->json(['message' => 'Autoevaluación creada con éxito'], 201);
    } catch (\Exception $e) {
        Log::error('Error al guardar la autoevaluación:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error al crear la autoevaluación', 'error' => $e->getMessage()], 500);
    }
}

    public function index($projectId)
    {
        $autoevaluaciones = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->with(['preguntas.opciones']) // Relación de preguntas con opciones
            ->get();

        return response()->json($autoevaluaciones, 200);
    }

    public function update(Request $request, $projectId, $autoevaluacionId)
{
    $validated = $request->validate([
        'TITULO_AUTOEVAL' => 'required|string|max:255',
        'DESCRIPCION_AUTOEVAL' => 'nullable|string',
        'FECHA_INICIO_AUTOEVAL' => 'required|date',
        'FECHA_FIN_AUTOEVAL' => 'required|date|after_or_equal:FECHA_INICIO_AUTOEVAL',
        'PUNTUACION_TOTAL_AUTOEVAL' => 'required|integer|min:0',
    ]);

    try {
        $autoevaluacion = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->where('ID_AUTOEVAL_PROYECTO', $autoevaluacionId)
            ->firstOrFail();

        $autoevaluacion->update([
            'TITULO_AUTOEVAL' => $validated['TITULO_AUTOEVAL'],
            'DESCRIPCION_AUTOEVAL' => $validated['DESCRIPCION_AUTOEVAL'],
            'FECHA_INICIO_AUTOEVAL' => $validated['FECHA_INICIO_AUTOEVAL'],
            'FECHA_FIN_AUTOEVAL' => $validated['FECHA_FIN_AUTOEVAL'],
            'PUNTUACION_TOTAL_AUTOEVAL' => $validated['PUNTUACION_TOTAL_AUTOEVAL'],
        ]);

        return response()->json([
            'message' => 'Autoevaluación actualizada con éxito',
            'autoevaluacion' => $autoevaluacion,
        ], 200);
    } catch (\Exception $e) {
        Log::error('Error al actualizar la autoevaluación:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error al actualizar la autoevaluación', 'error' => $e->getMessage()], 500);
    }
}

    public function updatePregunta(Request $request, $projectId, $preguntaId)
{
    $validated = $request->validate([
        'PREGUNTA_AUTOEVAL' => 'required|string',
        'opciones' => 'required|array',
        'opciones.*.ID_OPCION_AUTOEVAL' => 'nullable|integer', // Permite incluir identificadores opcionales para las opciones existentes
        'opciones.*.texto' => 'required|string',
        'opciones.*.puntuacion' => 'required|integer|min:0',
    ]);

    try {
        // Buscar la pregunta asociada al proyecto
        $pregunta = PreguntaAutoevaluacion::where('ID_AUTOEVAL_PROYECTO', function ($query) use ($projectId) {
            $query->select('ID_AUTOEVAL_PROYECTO')
                ->from('autoevaluaciones_proyecto')
                ->where('ID_PROYECTO', $projectId)
                ->limit(1);
        })->where('ID_PREGUNTA_AUTOEVAL', $preguntaId)->firstOrFail();

        // Actualizar el texto de la pregunta
        $pregunta->update(['PREGUNTA_AUTOEVAL' => $validated['PREGUNTA_AUTOEVAL']]);

        // Obtener los IDs de las opciones que llegan en la solicitud
        $opcionesEnviadas = collect($validated['opciones']);
        $idsOpcionesEnviadas = $opcionesEnviadas->pluck('ID_OPCION_AUTOEVAL')->filter();

        // Eliminar las opciones que no están en la solicitud
        OpcionPreguntaAutoevaluacion::where('ID_PREGUNTA_AUTOEVAL', $preguntaId)
            ->whereNotIn('ID_OPCION_AUTOEVAL', $idsOpcionesEnviadas)
            ->delete();

        // Procesar las opciones enviadas: crear nuevas o actualizar existentes
        foreach ($opcionesEnviadas as $opcion) {
            OpcionPreguntaAutoevaluacion::updateOrCreate(
                [
                    'ID_OPCION_AUTOEVAL' => $opcion['ID_OPCION_AUTOEVAL'] ?? null,
                ],
                [
                    'ID_PREGUNTA_AUTOEVAL' => $pregunta->ID_PREGUNTA_AUTOEVAL,
                    'TEXTO_OPCION_AUTOEVAL' => $opcion['texto'],
                    'PUNTUACION_OPCION_AUTOEVAL' => $opcion['puntuacion'],
                ]
            );
        }

        // Retornar respuesta con las opciones actualizadas
        $opcionesActualizadas = OpcionPreguntaAutoevaluacion::where('ID_PREGUNTA_AUTOEVAL', $preguntaId)->get();

        return response()->json([
            'message' => 'Pregunta y opciones actualizadas con éxito',
            'opciones' => $opcionesActualizadas,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error al actualizar la pregunta',
            'error' => $e->getMessage(),
        ], 500);
    }
}

public function updateOpciones(Request $request, $projectId, $preguntaId)
{
    $validated = $request->validate([
        'opciones' => 'required|array',
        'opciones.*.ID_OPCION_AUTOEVAL' => 'nullable|integer',
        'opciones.*.texto' => 'required|string',
        'opciones.*.puntuacion' => 'required|integer|min:0',
    ]);

    $pregunta = PreguntaAutoevaluacion::where('ID_AUTOEVAL_PROYECTO', function ($query) use ($projectId) {
        $query->select('ID_AUTOEVAL_PROYECTO')
            ->from('autoevaluaciones_proyecto')
            ->where('ID_PROYECTO', $projectId);
    })->where('ID_PREGUNTA_AUTOEVAL', $preguntaId)->firstOrFail();

    foreach ($validated['opciones'] as $opcion) {
        OpcionPreguntaAutoevaluacion::updateOrCreate(
            [
                'ID_OPCION_AUTOEVAL' => $opcion['ID_OPCION_AUTOEVAL'] ?? null,
                'ID_PREGUNTA_AUTOEVAL' => $pregunta->ID_PREGUNTA_AUTOEVAL,
            ],
            [
                'TEXTO_OPCION_AUTOEVAL' => $opcion['texto'],
                'PUNTUACION_OPCION_AUTOEVAL' => $opcion['puntuacion'],
            ]
        );
    }

    return response()->json([
        'message' => 'Opciones actualizadas con éxito',
        'opciones' => OpcionPreguntaAutoevaluacion::where('ID_PREGUNTA_AUTOEVAL', $pregunta->ID_PREGUNTA_AUTOEVAL)->get(),
    ], 200);
}

    public function destroy($projectId, $autoevaluacionId)
    {
        $autoevaluacion = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)
            ->where('ID_AUTOEVAL_PROYECTO', $autoevaluacionId)
            ->firstOrFail();

        $autoevaluacion->delete();

        return response()->json(['message' => 'Autoevaluación eliminada con éxito'], 200);
    }

    public function destroyPregunta($preguntaId)
    {
        $pregunta = PreguntaAutoevaluacion::findOrFail($preguntaId);
        $pregunta->delete();

        return response()->json(['message' => 'Pregunta eliminada con éxito'], 200);
    }

    public function destroyOpcion($opcionId)
{
    try {
        $opcion = OpcionPreguntaAutoevaluacion::findOrFail($opcionId);
        $opcion->delete();

        return response()->json(['message' => 'Opción eliminada con éxito'], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error al eliminar la opción', 'error' => $e->getMessage()], 500);
    }
}

    public function addOption(Request $request, $preguntaId)
{
    $validated = $request->validate([
        'texto' => 'required|string',
        'puntuacion' => 'required|integer|min:0',
    ]);

    $opcion = OpcionPreguntaAutoevaluacion::create([
        'ID_PREGUNTA_AUTOEVAL' => $preguntaId,
        'TEXTO_OPCION_AUTOEVAL' => $validated['texto'],
        'PUNTUACION_OPCION_AUTOEVAL' => $validated['puntuacion'],
    ]);

    return response()->json([
        'message' => 'Opción creada con éxito',
        'opciones' => OpcionPreguntaAutoevaluacion::where('ID_PREGUNTA_AUTOEVAL', $preguntaId)->get()
    ], 201);
}
public function addPregunta(Request $request, $projectId)
{
    $validated = $request->validate([
        'PREGUNTA_AUTOEVAL' => 'required|string|max:255',
        'opciones' => 'required|array|min:1',
        'opciones.*.texto' => 'required|string|max:255',
        'opciones.*.puntuacion' => 'required|integer|min:0',
    ]);

    try {
        $autoevaluacion = AutoevaluacionProyecto::where('ID_PROYECTO', $projectId)->firstOrFail();

        $pregunta = PreguntaAutoevaluacion::create([
            'ID_AUTOEVAL_PROYECTO' => $autoevaluacion->ID_AUTOEVAL_PROYECTO,
            'PREGUNTA_AUTOEVAL' => $validated['PREGUNTA_AUTOEVAL'],
        ]);

        foreach ($validated['opciones'] as $opcion) {
            OpcionPreguntaAutoevaluacion::create([
                'ID_PREGUNTA_AUTOEVAL' => $pregunta->ID_PREGUNTA_AUTOEVAL,
                'TEXTO_OPCION_AUTOEVAL' => $opcion['texto'],
                'PUNTUACION_OPCION_AUTOEVAL' => $opcion['puntuacion'],
            ]);
        }

        return response()->json([
            'message' => 'Pregunta añadida con éxito',
            'pregunta' => $pregunta,
        ], 201);
    } catch (\Exception $e) {
        Log::error('Error al agregar la pregunta:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error al agregar la pregunta', 'error' => $e->getMessage()], 500);
    }
}

}
