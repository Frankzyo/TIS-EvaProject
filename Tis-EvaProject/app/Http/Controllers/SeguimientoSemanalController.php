<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SeguimientoSemanal;

class SeguimientoSemanalController extends Controller
{
    // Obtener los seguimientos de un proyecto
    public function index($projectId)
    {
        $seguimientos = SeguimientoSemanal::where('ID_PROYECTO', $projectId)->get();
        return response()->json($seguimientos);
    }

    // Obtener los seguimientos de un grupo específico en un proyecto
    public function getByGroup($projectId, $groupId)
    {
        $seguimientos = SeguimientoSemanal::where('ID_PROYECTO', $projectId)
            ->where('ID_GRUPO', $groupId)
            ->get();

        return response()->json($seguimientos);
    }

    // Crear un nuevo seguimiento
    public function store(Request $request)
    {
        $request->validate([
            'ID_PROYECTO' => 'required|exists:proyecto,ID_PROYECTO',
            'ID_GRUPO' => 'required|exists:grupo,ID_GRUPO',
            'FECHA_REVISION' => 'required|date|unique:seguimiento_semanal,FECHA_REVISION,NULL,NULL,ID_PROYECTO,' . $request->ID_PROYECTO . ',ID_GRUPO,' . $request->ID_GRUPO,
            'REVISO_ACTUAL' => 'required|string',
            'REVISARA_SIGUIENTE' => 'required|string',
        ]);

        $seguimiento = SeguimientoSemanal::create($request->all());

        return response()->json([
            'message' => 'Seguimiento creado exitosamente.',
            'seguimiento' => $seguimiento,
        ]);
    }

    // Actualizar un seguimiento
    public function update(Request $request, $id)
    {
        $seguimiento = SeguimientoSemanal::findOrFail($id);

        $request->validate([
            'FECHA_REVISION' => 'required|date',
            'REVISO_ACTUAL' => 'required|string',
            'REVISARA_SIGUIENTE' => 'required|string',
        ]);

        $seguimiento->update($request->all());

        return response()->json([
            'message' => 'Seguimiento actualizado exitosamente.',
            'seguimiento' => $seguimiento,
        ]);
    }

    // Eliminar un seguimiento
    public function destroy($id)
    {
        $seguimiento = SeguimientoSemanal::findOrFail($id);
        $seguimiento->delete();

        return response()->json(['message' => 'Seguimiento eliminado exitosamente.']);
    }

    // Eliminar todos los seguimientos de un grupo
    public function deleteByGroup($groupId)
    {
        $deleted = SeguimientoSemanal::where('ID_GRUPO', $groupId)->delete();

        return response()->json([
            'message' => 'Seguimientos eliminados exitosamente.',
            'deleted_count' => $deleted,
        ]);
    }
}
