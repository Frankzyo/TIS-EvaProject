<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EstudianteAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verificar si el correo existe en la base de datos
        $user = \App\Models\Estudiante::where('EMAIL_EST', $request->email)->first();

        if (!$user) {
            // Si el correo no existe, devolver un mensaje apropiado
            return response()->json(['error' => 'La cuenta de estudiante no existe.'], 404);
        }

        // Intentar la autenticación con las credenciales proporcionadas
        $credentials = ['EMAIL_EST' => $request->email, 'password' => $request->password];

        if (Auth::guard('estudiante')->attempt($credentials)) {
            $user = Auth::guard('estudiante')->user();

            if (!$user->APPROVED) {
                Auth::guard('estudiante')->logout();
                return response()->json(['error' => 'Tu cuenta está pendiente de aprobación.'], 403);
            }

            return response()->json([
                'role' => 'Estudiante',
                'is_rl' => (bool) $user->IS_RL,
                'id' => $user->ID_EST, // Asegúrate de que esto sea el ID correcto del estudiante
                'message' => 'Login exitoso',
            ]);
        }

        return response()->json(['error' => 'Credenciales inválidas'], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('estudiante')->logout();
        return response()->json(['message' => 'Cierre de sesión exitoso']);
    }

    public function getPendingStudents()
{
    if (!Auth::guard('docente')->check()) {
        return response()->json(['error' => 'No autorizado'], 403);
    }

    $pendingStudents = Estudiante::where('APPROVED', 0)->get();
    return response()->json($pendingStudents);
}

    public function approveStudent($id)
    {
        // Verificar que el usuario esté autenticado como docente
        if (!Auth::guard('docente')->check()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $student = Estudiante::findOrFail($id);

        // Actualiza los campos de aprobación
        $student->APPROVED = 1;
        $student->IS_RL = 1;
        $student->save();

        return response()->json(['message' => 'Estudiante aprobado exitosamente.']);
    }
    public function registerToProject($projectId)
    {
        // Obtener el estudiante logueado
        $student = Auth::guard('estudiante')->user();

        // Verificar que el estudiante esté autenticado y que se haya obtenido el objeto correctamente
        if (!$student) {
            return response()->json(['error' => 'No se encontró al estudiante autenticado.'], 401);
        }

        // Actualizar el ID_PROYECTO del estudiante directamente en la base de datos
        DB::table('ESTUDIANTE')
            ->where('ID_EST', $student->ID_EST)
            ->update(['ID_PROYECTO' => $projectId]);

        return response()->json(['message' => 'Estudiante registrado en el proyecto exitosamente'], 200);
    }
    public function getRegisteredProject($studentId)
    {
        $student = Estudiante::find($studentId);

        if ($student && $student->ID_PROYECTO) {
            return response()->json(['projectId' => $student->ID_PROYECTO]);
        }

        return response()->json(['projectId' => null]);
    }
}
