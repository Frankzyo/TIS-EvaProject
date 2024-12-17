<?php

namespace App\Http\Controllers;

use App\Models\HistoriaUsuario;
use App\Models\TareaHu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HistoriaUsuarioController extends Controller
{
    /**
     * Mostrar una lista de todas las historias de usuario.
     */
    public function index($groupId)
    {
        // Filtra las historias de usuario por el ID de grupo
        $historias = HistoriaUsuario::where('ID_GRUPO', $groupId)->get();
        return response()->json($historias);
    }


    /**
     * Mostrar una historia de usuario específica por su ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */


    public function show($id)
    {
        Log::info("Buscando historia de usuario con ID: " . $id);

        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            Log::info("Historia de usuario no encontrada");
            return response()->json(['error' => 'Historia de usuario no encontrada'], 404);
        }

        Log::info("Historia de usuario encontrada: ", [$historia]);
        $historia->IMAGEN_HU = json_decode($historia->IMAGEN_HU);

        return response()->json($historia);
    }


    /**
     * Almacenar una nueva historia de usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'TITULO_HU' => 'required|string|max:255',
            'DESCRIP_HU' => 'required|string',
            'archivos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // Valida que los archivos sean imágenes
        ]);

        $historia = new HistoriaUsuario();
        $historia->TITULO_HU = $request->TITULO_HU;
        $historia->DESCRIP_HU = $request->DESCRIP_HU;
        $historia->ID_GRUPO = $request->ID_GRUPO; // Asegúrate de asignar el ID del grupo correctamente
        $historia->save();

        // Procesar y guardar cada imagen
        $imagenes = [];
        if ($request->hasFile('archivos')) {
            foreach ($request->file('archivos') as $file) {
                $path = $file->store('imagenes_historias', 'public'); // Guarda en storage/app/public/imagenes_historias
                $imagenes[] = basename($path); // Guarda solo el nombre del archivo para almacenar en la base de datos
            }

            // Asigna la lista de imágenes al modelo, si tienes un campo en la base de datos para ellas
            $historia->IMAGEN_HU = json_encode($imagenes); // Supongamos que IMAGEN_HU es un campo tipo JSON en la base de datos
            $historia->save();
        }

        return response()->json(['message' => 'Historia de Usuario creada exitosamente', 'historia' => $historia]);
    }


    /**
     * Actualizar una historia de usuario existente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Encuentra la historia por su ID
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['error' => 'Historia de usuario no encontrada'], 404);
        }

        // Validación de los datos de entrada
        $validator = Validator::make($request->all(), [
            'ID_GRUPO' => 'nullable|integer',
            'TITULO_HU' => 'nullable|string|max:200',
            'DESCRIP_HU' => 'nullable|string',
            'IMAGEN_HU' => 'nullable|string|max:1000',
            'COMENTARIO_HU' => 'nullable|string|max:1000',
            'PONDERACION_HU' => 'nullable|numeric',
            'FECHACREACION_HU' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualiza los campos con los nuevos datos proporcionados
        $historia->update($request->all());

        return response()->json(['message' => 'Historia de usuario actualizada exitosamente', 'historia' => $historia]);
    }

    /**
     * Eliminar una historia de usuario específica.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['error' => 'Historia de usuario no encontrada'], 404);
        }

        if ($historia->IMAGEN_HU) {
            $imagenes = json_decode($historia->IMAGEN_HU);
            foreach ($imagenes as $imagen) {
                $filePath = storage_path("app/public/imagenes_historias/{$imagen}");
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
        }

        $historia->delete();

        return response()->json(['message' => 'Historia de usuario eliminada exitosamente']);
    }

    public function eliminarImagen($fileName)
    {
        try {
            // Ruta completa al archivo en el almacenamiento
            $filePath = storage_path("app/public/imagenes_historias/{$fileName}");

            // Verificar si el archivo existe y eliminarlo del sistema de archivos
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Actualizar el campo IMAGEN_HU en la base de datos
            $historia = HistoriaUsuario::where('IMAGEN_HU', 'like', '%' . $fileName . '%')->first();
            if ($historia) {
                // Remover la imagen del arreglo de imágenes
                $imagenes = json_decode($historia->IMAGEN_HU, true);
                $imagenes = array_filter($imagenes, fn($img) => $img !== $fileName);
                $historia->IMAGEN_HU = json_encode(array_values($imagenes));
                $historia->save();
            }

            return response()->json(['message' => 'Imagen eliminada exitosamente.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar la imagen.'], 500);
        }
    }
    public function actualizarTitulo(Request $request, $id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['error' => 'Historia de usuario no encontrada'], 404);
        }

        $historia->TITULO_HU = $request->input('titulo');
        $historia->save();

        return response()->json(['message' => 'Título actualizado correctamente'], 200);
    }
    public function actualizarDescripcion(Request $request, $id)
    {
        $historia = HistoriaUsuario::find($id);

        if (!$historia) {
            return response()->json(['error' => 'Historia de usuario no encontrada'], 404);
        }

        $historia->DESCRIP_HU = $request->input('descripcion');
        $historia->save();

        return response()->json(['message' => 'Descripción actualizada correctamente'], 200);
    }
    public function subirImagen(Request $request, $id)
    {
        try {
            // Validar que el archivo esté presente y sea una imagen
            $request->validate([
                'imagen' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            // Obtener la historia de usuario
            $historiaUsuario = HistoriaUsuario::findOrFail($id);

            // Almacenar la imagen en el sistema de archivos
            $path = $request->file('imagen')->store('imagenes_historias', 'public');

            // Guardar solo el nombre del archivo
            $filename = basename($path);

            // Obtener el arreglo actual de imágenes, si existe
            $imagenes = $historiaUsuario->IMAGEN_HU ? json_decode($historiaUsuario->IMAGEN_HU, true) : [];

            // Agregar el nuevo archivo al arreglo
            $imagenes[] = $filename;

            // Actualizar el campo IMAGEN_HU en la base de datos
            $historiaUsuario->IMAGEN_HU = json_encode($imagenes);
            $historiaUsuario->save();

            return response()->json(['message' => 'Imagen subida exitosamente', 'imagen' => $filename], 200);
        } catch (\Exception $e) {
            Log::error("Error al subir la imagen: " . $e->getMessage());
            return response()->json(['error' => 'Error al subir la imagen'], 500);
        }
    }
    public function agregarTarea(Request $request, $idHu)
    {
        $request->validate([
            'TITULO_TAREAHU' => 'required|string|max:255',
            'ESTADO_TAREAHU' => 'required|string|max:50',
            'RESPONSABLE_TAREAHU' => 'nullable|string|max:255',
            'FOTO_RESPONSABLE' => 'nullable|string|max:255',
        ]);

        $tarea = new TareaHu();
        $tarea->ID_HU = $idHu;
        $tarea->TITULO_TAREAHU = $request->TITULO_TAREAHU;
        $tarea->ESTADO_TAREAHU = $request->ESTADO_TAREAHU;
        $tarea->RESPONSABLE_TAREAHU = $request->RESPONSABLE_TAREAHU;
        $tarea->FOTO_RESPONSABLE = $request->FOTO_RESPONSABLE;
        $tarea->save();

        return response()->json(['message' => 'Tarea creada exitosamente', 'tarea' => $tarea]);
    }
    public function obtenerTareas($idHu)
    {
        $tareas = TareaHu::where('ID_HU', $idHu)->get();
        return response()->json($tareas);
    }
    public function eliminarTarea($idTarea)
    {
        $tarea = TareaHu::find($idTarea);

        if (!$tarea) {
            return response()->json(['error' => 'Tarea no encontrada'], 404);
        }

        $tarea->delete();

        return response()->json(['message' => 'Tarea eliminada exitosamente']);
    }
    public function actualizarTarea(Request $request, $id)
    {
        $request->validate([
            'TITULO_TAREAHU' => 'required|string|max:255',
            'ESTADO_TAREAHU' => 'required|string|max:50',
            'RESPONSABLE_TAREAHU' => 'nullable|string|max:255',
        ]);

        $tarea = TareaHu::find($id);

        if (!$tarea) {
            return response()->json(['error' => 'Tarea no encontrada'], 404);
        }

        $tarea->TITULO_TAREAHU = $request->input('TITULO_TAREAHU');
        $tarea->ESTADO_TAREAHU = $request->input('ESTADO_TAREAHU');
        $tarea->RESPONSABLE_TAREAHU = $request->input('RESPONSABLE_TAREAHU');
        $tarea->save();

        return response()->json(['message' => 'Tarea actualizada exitosamente', 'tarea' => $tarea]);
    }
    public function asignarResponsable(Request $request, $idTarea)
    {
        try {
            // Validar que el nombre y la foto sean proporcionados
            $request->validate([
                'RESPONSABLE_TAREAHU' => 'required|string|max:255',
                'FOTO_RESPONSABLE' => 'nullable|string|max:255', // Validar la foto como un string
            ]);

            // Buscar la tarea en la base de datos
            $tarea = TareaHU::findOrFail($idTarea);

            // Actualizar el responsable y la foto en la base de datos
            $tarea->RESPONSABLE_TAREAHU = $request->input('RESPONSABLE_TAREAHU');
            $tarea->FOTO_RESPONSABLE = $request->input('FOTO_RESPONSABLE');
            $tarea->save();

            return response()->json(['message' => 'Responsable asignado correctamente', 'tarea' => $tarea], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al asignar el responsable', 'details' => $e->getMessage()], 500);
        }
    }
}