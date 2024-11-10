<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EstudianteController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'NOMBRE_EST' => 'required|string|max:100',
            'EMAIL_EST' => 'required|email|max:100|unique:estudiante',
            'APELLIDO_EST' => 'nullable|string|max:100',
            'ID_GRUPO' => 'required|exists:grupo,ID_GRUPO',
            'ID_PROYECTO' => 'required|exists:proyecto,ID_PROYECTO', // Valida que el proyecto exista
        ]);

        $password = Str::random(8);
        $hashedPassword = Hash::make($password);

        $estudiante = Estudiante::create([
            'NOMBRE_EST' => $request->input('NOMBRE_EST'),
            'APELLIDO_EST' => $request->input('APELLIDO_EST', ''),
            'EMAIL_EST' => $request->input('EMAIL_EST'),
            'PASSWORD_EST' => $hashedPassword,
            'ID_GRUPO' => $request->input('ID_GRUPO'),
            'ID_PROYECTO' => $request->input('ID_PROYECTO'), // Confirmar que se asigna aquí
        ]);


        $this->enviarCorreoCredenciales($estudiante, $password);

        return response()->json(['message' => 'Estudiante registrado y correo enviado'], 201);
    }


    private function enviarCorreoCredenciales($estudiante, $password)
    {
        $data = [
            'name' => $estudiante->NOMBRE_EST,
            'email' => $estudiante->EMAIL_EST,
            'password' => $password
        ];

        Mail::send('emails.credenciales', $data, function ($message) use ($estudiante) {
            $message->to($estudiante->EMAIL_EST, $estudiante->NOMBRE_EST)
                ->subject('Credenciales de acceso');
        });
    }
    public function index(Request $request)
    {
        $groupId = $request->input('ID_GRUPO');

        try {
            $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get();
            return response()->json($estudiantes, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cargar estudiantes'], 500);
        }
    }
    public function destroy($id)
    {
        $estudiante = Estudiante::find($id);
        if ($estudiante) {
            $estudiante->delete();
            return response()->json(['message' => 'Estudiante eliminado'], 200);
        }
        return response()->json(['error' => 'Estudiante no encontrado'], 404);
    }
    public function obtenerProyectoYGrupo(Request $request)
    {
        try {
            $estudianteId = $request->user()->ID_EST;

            // Obtener el estudiante con su proyecto, requerimientos del proyecto y grupo (junto con requerimientos del grupo)
            $estudiante = Estudiante::with(['proyecto.requerimientos', 'grupo.requerimientos'])->find($estudianteId);

            if (!$estudiante) {
                return response()->json(['message' => 'Estudiante no encontrado'], 404);
            }

            // Combina los requerimientos del proyecto (docente) y del grupo (estudiante)
            $requerimientosDocente = $estudiante->proyecto->requerimientos ?? [];
            $requerimientosEstudiante = $estudiante->grupo->requerimientos ?? [];

            return response()->json([
                'proyecto' => $estudiante->proyecto,
                'grupo' => $estudiante->grupo,
                'requerimientos' => array_merge($requerimientosDocente->toArray(), $requerimientosEstudiante->toArray())
            ]);
        } catch (\Exception $e) {
            Log::error("Error al obtener proyecto y grupo: " . $e->getMessage());
            return response()->json(['message' => 'Error al obtener datos del estudiante'], 500);
        }
    }
}
