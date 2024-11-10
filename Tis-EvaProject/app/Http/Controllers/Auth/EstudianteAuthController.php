<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class EstudianteAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = ['EMAIL_EST' => $request->email, 'password' => $request->password];

        if (Auth::guard('estudiante')->attempt($credentials)) {
            return response()->json([
                'role' => 'Estudiante',
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
}

