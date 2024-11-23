<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Docente;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DocenteAuthController extends Controller
{

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Verificar si el correo existe en la base de datos de docentes
        $user = Docente::where('EMAIL_DOCENTE', $request->email)->first();

        if (!$user) {
            // Si el correo no existe, devolver un mensaje adecuado
            return response()->json(['error' => 'La cuenta de docente no existe.'], 404);
        }

        // Intentar la autenticación con las credenciales proporcionadas
        $credentials = ['EMAIL_DOCENTE' => $request->email, 'password' => $request->password];

        if (Auth::guard('docente')->attempt($credentials)) {
            $user = Auth::guard('docente')->user();

            // Verificar si el usuario ha sido aprobado
            if (!$user->approved) {
                Auth::guard('docente')->logout();
                return response()->json(['error' => 'Tu cuenta está pendiente de aprobación.'], 403);
            }

            return response()->json([
                'role' => 'Docente',
                'is_admin' => (bool) $user->is_admin, // Asegurar que se envíe como booleano
                'message' => 'Login exitoso',
            ]);
        }

        return response()->json(['error' => 'Credenciales inválidas'], 401);
    }


    public function logout(Request $request)
    {
        Auth::guard('docente')->logout();
        return response()->json(['message' => 'Cierre de sesión exitoso']);
    }

    public function getPendingUsers()
    {
        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $pendingUsers = Docente::where('approved', false)->get();
        return response()->json($pendingUsers);
    }

    public function getAllUsers()
    {
        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $docentes = Docente::where('is_admin', false)->where('approved', true)->get();
        return response()->json($docentes);
    }

    public function assignAdmin($id)
    {
        Log::info('Iniciando assignAdmin con ID: ' . $id);

        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
            Log::error('Usuario no autorizado o no es administrador');
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $usuario = Docente::find($id);
        if (!$usuario) {
            Log::error('Docente no encontrado con ID: ' . $id);
            return response()->json(['error' => 'Docente no encontrado'], 404);
        }

        $usuario->is_admin = true;
        $usuario->save();

        Log::info('Permisos de administrador asignados al docente con ID: ' . $id);
        return response()->json(['message' => 'Permisos de administrador asignados exitosamente']);
    }

    public function approveUser($id)
    {
        if (!Auth::guard('docente')->check()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $user = Docente::find($id);
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $user->approved = true;
        $user->save();

        return response()->json(['message' => 'Usuario aprobado exitosamente']);
    }
    public function getPendingTeachers()
    {
        // Verifica que el usuario esté autenticado y sea administrador
        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Consulta para obtener los docentes pendientes de aprobación
        $pendingTeachers = Docente::where('approved', false)->get();

        // Retorna la respuesta en formato JSON
        return response()->json($pendingTeachers);
    }

    // En tu controlador de estudiantes
    public function countPendingStudents()
    {
        // Verificar si el usuario actual es un administrador
        if (!Auth::guard('docente')->check()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Contar estudiantes no aprobados
        $pendingCount = Estudiante::where('approved', false)->count();

        return response()->json(['count' => $pendingCount]);
    }
}
