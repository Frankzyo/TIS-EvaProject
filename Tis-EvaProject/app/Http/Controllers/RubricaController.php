<?php

namespace App\Http\Controllers;

use App\Models\Rubrica;
use App\Models\Criterio;
use App\Models\Nivel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RubricaController extends Controller
{
    // Obtener todas las rúbricas para un proyecto y etapa específicos
    public function index($projectId, $etapaId)
    {
        $rubricas = Rubrica::where('ID_PROYECTO', $projectId)
            ->where('ID_ETAPA', $etapaId)
            ->with('criterios.niveles')
            ->get();
        return response()->json($rubricas);
    }

    // Crear una nueva rúbrica
    public function store(Request $request)
    {
        Log::info($request->all());

        $validatedData = $request->validate([
            'titulo' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'projectId' => 'required|string|max:50',
            'etapaId' => 'required|integer',
            'criterios' => 'required|array',
            'criterios.*.titulo' => 'required|string|max:255',
            'criterios.*.descripcion' => 'nullable|string',
            'criterios.*.niveles' => 'required|array',
            'criterios.*.niveles.*.titulo' => 'required|string|max:255',
            'criterios.*.niveles.*.descripcion' => 'nullable|string',
            'criterios.*.niveles.*.puntos' => 'required|numeric|min:0',
        ]);

        try {
            $pesoRubrica = 0;

            $rubrica = Rubrica::create([
                'NOMBRE_RUBRICA' => $validatedData['titulo'],
                'DESCRIPCION_RUBRICA' => $validatedData['descripcion'],
                'ID_PROYECTO' => $validatedData['projectId'],
                'ID_ETAPA' => $validatedData['etapaId'],
            ]);

            foreach ($validatedData['criterios'] as $criterioData) {
                $maxPuntaje = max(array_column($criterioData['niveles'], 'puntos'));
                $pesoRubrica += $maxPuntaje;

                $criterio = $rubrica->criterios()->create([
                    'NOMBRE_CRITERIO' => $criterioData['titulo'],
                    'DESCRIPCION_CRITERIO' => $criterioData['descripcion'],
                    'PESO_CRITERIO' => $maxPuntaje,
                ]);

                foreach ($criterioData['niveles'] as $nivelData) {
                    $criterio->niveles()->create([
                        'TITULO_NIVEL' => $nivelData['titulo'],
                        'DESCRIPCION_NIVEL' => $nivelData['descripcion'],
                        'PUNTOS' => $nivelData['puntos'],
                    ]);
                }
            }

            $rubrica->update(['PESO_RUBRICA' => $pesoRubrica]);

            return response()->json(['message' => 'Rúbrica creada exitosamente'], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear la rúbrica: ' . $e->getMessage());
            return response()->json(['error' => 'Error al crear la rúbrica', 'details' => $e->getMessage()], 500);
        }
    }

    // Actualizar una rúbrica existente
    public function update(Request $request, $id)
    {
        Log::info("Actualizando la rúbrica con ID: $id");

        $rubrica = Rubrica::findOrFail($id);

        $validatedData = $request->validate([
            'titulo' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'criterios' => 'nullable|array',
            'criterios.*.ID_CRITERIO' => 'nullable|exists:criterios,ID_CRITERIO',
            'criterios.*.titulo' => 'nullable|string|max:255',
            'criterios.*.descripcion' => 'nullable|string',
            'criterios.*.niveles' => 'nullable|array',
            'criterios.*.niveles.*.ID_NIVEL' => 'nullable|exists:niveles,ID_NIVEL',
            'criterios.*.niveles.*.titulo' => 'nullable|string|max:255',
            'criterios.*.niveles.*.descripcion' => 'nullable|string',
            'criterios.*.niveles.*.puntos' => 'required|numeric|min:0',
        ]);

        $rubrica->update([
            'NOMBRE_RUBRICA' => $validatedData['titulo'] ?? $rubrica->NOMBRE_RUBRICA,
            'DESCRIPCION_RUBRICA' => $validatedData['descripcion'] ?? $rubrica->DESCRIPCION_RUBRICA,
        ]);

        Log::info("Datos de criterios recibidos:", $validatedData['criterios'] ?? []);

        $existingCriterioIds = [];
        $existingNivelIds = [];

        if (isset($validatedData['criterios'])) {
            foreach ($validatedData['criterios'] as $criterioData) {
                $criterio = null;

                if (isset($criterioData['ID_CRITERIO'])) {
                    $criterio = Criterio::find($criterioData['ID_CRITERIO']);
                    if ($criterio) {
                        Log::info("Actualizando criterio con ID: {$criterio->ID_CRITERIO}");
                        $criterio->update([
                            'NOMBRE_CRITERIO' => $criterioData['titulo'],
                            'DESCRIPCION_CRITERIO' => $criterioData['descripcion'],
                        ]);
                    }
                } else {
                    Log::info("Creando nuevo criterio para rúbrica ID: {$rubrica->ID_RUBRICA}");
                    $criterio = $rubrica->criterios()->create([
                        'NOMBRE_CRITERIO' => $criterioData['titulo'],
                        'DESCRIPCION_CRITERIO' => $criterioData['descripcion'],
                    ]);
                }

                if ($criterio) {
                    $existingCriterioIds[] = $criterio->ID_CRITERIO;

                    $maxPuntaje = 0;
                    if (isset($criterioData['niveles'])) {
                        foreach ($criterioData['niveles'] as $nivelData) {
                            $nivel = null;

                            if (isset($nivelData['ID_NIVEL'])) {
                                $nivel = Nivel::find($nivelData['ID_NIVEL']);
                                if ($nivel) {
                                    Log::info("Actualizando nivel con ID: {$nivel->ID_NIVEL}");
                                    $nivel->update([
                                        'TITULO_NIVEL' => $nivelData['titulo'],
                                        'DESCRIPCION_NIVEL' => $nivelData['descripcion'],
                                        'PUNTOS' => $nivelData['puntos'],
                                    ]);
                                }
                            } else {
                                Log::info("Creando nuevo nivel para criterio ID: {$criterio->ID_CRITERIO}");
                                $nivel = $criterio->niveles()->create([
                                    'TITULO_NIVEL' => $nivelData['titulo'],
                                    'DESCRIPCION_NIVEL' => $nivelData['descripcion'],
                                    'PUNTOS' => $nivelData['puntos'],
                                ]);
                            }

                            if ($nivel) {
                                $existingNivelIds[] = $nivel->ID_NIVEL;
                                $maxPuntaje = max($maxPuntaje, $nivelData['puntos']); // Actualiza el puntaje máximo del criterio
                            }
                        }
                    }

                    // Actualiza el peso del criterio con el puntaje máximo
                    $criterio->update(['PESO_CRITERIO' => $maxPuntaje]);
                }
            }
        }

        // Eliminar criterios y niveles que no están en la lista actualizada
        $rubrica->criterios()->whereNotIn('ID_CRITERIO', $existingCriterioIds)->delete();
        Nivel::whereIn('ID_CRITERIO', $existingCriterioIds)
            ->whereNotIn('ID_NIVEL', $existingNivelIds)
            ->delete();

        // Recalcular el peso total de la rúbrica
        $pesoRubrica = $rubrica->criterios()->sum('PESO_CRITERIO');
        $rubrica->update(['PESO_RUBRICA' => $pesoRubrica]);

        Log::info("Rúbrica actualizada con éxito:", $rubrica->toArray());
        return response()->json($rubrica);
    }

    // Obtener detalles de una rúbrica específica
    public function show($id)
    {
        $rubrica = Rubrica::with('criterios.niveles')->findOrFail($id);
        return response()->json($rubrica);
    }

    // Eliminar una rúbrica
    public function destroy($id)
    {
        Rubrica::destroy($id);
        return response()->json(['message' => 'Rúbrica eliminada correctamente']);
    }
}
