<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use App\Models\Docente;
use App\Models\Estudiante;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validar los datos recibidos
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:Docente,Estudiante',
        ]);

        $credentials = $request->only('email', 'password');
        $role = $request->input('role');

        if ($role == 'Docente') {
            if (Auth::guard('docente')->attempt(['EMAIL_DOCENTE' => $credentials['email'], 'password' => $credentials['password']])) {
                // Inicio de sesión exitoso para docente
                return response()->json(['role' => 'Docente', 'message' => 'Login exitoso']);
            } else {
                return response()->json(['error' => 'Credenciales inválidas'], 401);
            }
        } elseif ($role == 'Estudiante') {
            if (Auth::guard('estudiante')->attempt(['EMAIL_EST' => $credentials['email'], 'password' => $credentials['password']])) {
                // Inicio de sesión exitoso para estudiante
                return response()->json(['role' => 'Estudiante', 'message' => 'Login exitoso']);
            } else {
                return response()->json(['error' => 'Credenciales inválidas'], 401);
            }
        }

        return response()->json(['error' => 'El rol no es válido'], 400);
    }

    public function logout(Request $request)
    {
        $role = $request->input('role');

        if ($role == 'Docente') {
            Auth::guard('docente')->logout();
        } elseif ($role == 'Estudiante') {
            Auth::guard('estudiante')->logout();
        }

        return response()->json(['message' => 'Cierre de sesión exitoso']);
    }

    public function getLoggedUser()
    {
        if (Auth::guard('docente')->check()) {
            $user = Auth::guard('docente')->user();
            return response()->json([
                'nombre' => $user->NOMBRE_DOCENTE,
                'apellido' => $user->APELLIDO_DOCENTE,
                'email' => $user->EMAIL_DOCENTE,
                'foto' => $user->FOTO_DOCENTE ?? 'https://via.placeholder.com/50'
            ]);
        } elseif (Auth::guard('estudiante')->check()) {
            $user = Auth::guard('estudiante')->user();
            return response()->json([
                'nombre' => $user->NOMBRE_EST,
                'apellido' => $user->APELLIDO_EST,
                'email' => $user->EMAIL_EST,
                'foto' => $user->FOTO_EST ?? 'https://via.placeholder.com/50'
            ]);
        }

        return response()->json(['error' => 'No autenticado'], 401);
    }

    public function updateProfile(Request $request)
    {
        try {
            // Obtener el usuario autenticado dependiendo de su rol
            $user = null;

            if (Auth::guard('docente')->check()) {
                $user = Docente::find(Auth::guard('docente')->id());
                $nombreCampo = 'NOMBRE_DOCENTE';
                $apellidoCampo = 'APELLIDO_DOCENTE';
                $emailCampo = 'EMAIL_DOCENTE';
                $fotoCampo = 'FOTO_DOCENTE';
            } elseif (Auth::guard('estudiante')->check()) {
                $user = Estudiante::find(Auth::guard('estudiante')->id());
                $nombreCampo = 'NOMBRE_EST';
                $apellidoCampo = 'APELLIDO_EST';
                $emailCampo = 'EMAIL_EST';
                $fotoCampo = 'FOTO_EST';
            } else {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            if (!$user) {
                return response()->json(['error' => 'No autenticado'], 401);
            }

            // Validar los datos
            $request->validate([
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'email' => 'required|email',
                'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Actualizar los campos del usuario
            $user->{$nombreCampo} = $request->input('nombre');
            $user->{$apellidoCampo} = $request->input('apellido');
            $user->{$emailCampo} = $request->input('email');

            // Manejo de la imagen de perfil si se proporciona
            if ($request->hasFile('foto')) {
                $image = $request->file('foto');
                $imagePath = $image->store('profile_photos', 'public');

                // Eliminar la imagen anterior si existe
                if ($user->{$fotoCampo} && Storage::disk('public')->exists($user->{$fotoCampo})) {
                    Storage::disk('public')->delete($user->{$fotoCampo});
                }

                // Guardar la ruta de la nueva imagen
                $user->{$fotoCampo} = $imagePath;
            }

            // Guardar cambios en la base de datos
            $user->save();

            return response()->json([
                'message' => 'Perfil actualizado exitosamente',
                'nombre' => $user->{$nombreCampo},
                'apellido' => $user->{$apellidoCampo},
                'email' => $user->{$emailCampo},
                'foto' => $user->{$fotoCampo} ? Storage::url($user->{$fotoCampo}) : null,

            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil: ' . $e->getMessage());
            return response()->json(['error' => 'Ocurrió un error al actualizar el perfil.'], 500);
        }
    }
    public function changePassword(Request $request)
{
    try {
        $user = null;
        $passwordField = '';

        if (Auth::guard('docente')->check()) {
            /** @var \App\Models\Docente $user */
            $user = Auth::guard('docente')->user();
            $passwordField = 'PASSWORD_DOCENTE';
        } elseif (Auth::guard('estudiante')->check()) {
            /** @var \App\Models\Estudiante $user */
            $user = Auth::guard('estudiante')->user();
            $passwordField = 'PASSWORD_EST';
        } else {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Validar los datos de la solicitud
        $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:6|confirmed'
        ]);

        // Verificar que la contraseña actual sea correcta
        if (!Hash::check($request->input('currentPassword'), $user->{$passwordField})) {
            Log::info("Contraseña incorrecta detectada"); // Log para confirmar el flujo
            return response()->json(['error' => 'La contraseña actual es incorrecta'], 400);
        }
        

        // Actualizar la contraseña
        $user->{$passwordField} = Hash::make($request->input('newPassword'));
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada con éxito']);
    } catch (\Exception $e) {
        Log::error('Error al cambiar la contraseña: ' . $e->getMessage());
        return response()->json(['error' => 'Ocurrió un error al cambiar la contraseña'], 500);
    }
}

}
