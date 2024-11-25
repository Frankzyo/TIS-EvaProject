<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

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
            'APPROVED' => 1,
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
        // Obtener el ID del usuario autenticado
        $estudianteId = Auth::guard('estudiante')->id();
        $docenteId = Auth::guard('docente')->id();

        // Verificar autenticación
        if (!$estudianteId && !$docenteId) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Obtener el ID del grupo desde la solicitud
        $groupId = $request->input('ID_GRUPO');

        // Validar que el ID del grupo esté presente
        if (!$groupId) {
            return response()->json(['error' => 'ID de grupo requerido'], 400);
        }

        try {
            if ($docenteId) {
                // El docente puede ver todos los estudiantes del grupo
                $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get();
            } else {
                // El estudiante solo puede ver a los integrantes de su propio grupo
                $estudiante = Estudiante::find($estudianteId);
                if ($estudiante && $estudiante->ID_GRUPO == $groupId) {
                    $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get();
                } else {
                    // Si el estudiante intenta acceder a un grupo que no es el suyo, denegar acceso
                    return response()->json(['message' => 'No autorizado para ver este grupo'], 403);
                }
            }

            // Retornar los estudiantes encontrados en el grupo
            return response()->json($estudiantes, 200);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json(['error' => 'Error al cargar estudiantes'], 500);
        }
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
    public function destroy($id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id); // Busca el estudiante
            $estudiante->delete(); // Elimina el estudiante
            return response()->json(['message' => 'Estudiante eliminado'], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        } catch (\Exception $e) {
            // Registrar el error para verificar la causa exacta
            Log::error("Error al eliminar estudiante: " . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar estudiante'], 500);
        }
    }
    public function obtenerEstudiantesPorGrupo($groupId)
    {
        try {
            // Consulta para obtener todos los estudiantes con el mismo ID_GRUPO
            $estudiantes = Estudiante::where('ID_GRUPO', $groupId)->get();

            // Verifica si se encontraron estudiantes
            if ($estudiantes->isEmpty()) {
                return response()->json(['message' => 'No se encontraron estudiantes para este grupo'], 404);
            }

            return response()->json($estudiantes, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cargar estudiantes'], 500);
        }
    }
    public function updateRole(Request $request, $id)
    {
        try {
            $estudiante = Estudiante::findOrFail($id);
            $estudiante->ROL_EST = $request->input('ROL_EST');
            $estudiante->save();

            return response()->json(['message' => 'Rol actualizado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar el rol del estudiante'], 500);
        }
    }
    public function obtenerEstudiante($estudianteId)
    {
        try {
            $estudiante = Estudiante::findOrFail($estudianteId);
            return response()->json($estudiante, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al cargar los datos del estudiante'], 500);
        }
    }
}
