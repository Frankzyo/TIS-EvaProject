<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Docente;
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

        $credentials = ['EMAIL_DOCENTE' => $request->email, 'password' => $request->password];

        if (Auth::guard('docente')->attempt($credentials)) {
            $user = Auth::guard('docente')->user();
            if (!$user->approved) {
                Auth::guard('docente')->logout();
                return response()->json(['error' => 'Tu cuenta está pendiente de aprobación.'], 403);
            }

            return response()->json([
                'role' => 'Docente',
                'is_admin' => $user->is_admin,
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

        // Verificar autenticación y permisos de administrador
        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
            Log::error('Usuario no autorizado o no es administrador');
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Buscar al usuario docente
        $usuario = Docente::find($id);
        if (!$usuario) {
            Log::error('Docente no encontrado con ID: ' . $id);
            return response()->json(['error' => 'Docente no encontrado'], 404);
        }

        // Asignar permisos de administrador
        $usuario->is_admin = true;
        $usuario->save();

        Log::info('Permisos de administrador asignados al docente con ID: ' . $id);
        return response()->json(['message' => 'Permisos de administrador asignados exitosamente']);
    }
    public function approveUser($id)
    {
        if (!Auth::guard('docente')->check() || !Auth::guard('docente')->user()->is_admin) {
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

}
