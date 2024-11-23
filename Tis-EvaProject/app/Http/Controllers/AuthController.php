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
                'foto' => $user->FOTO_DOCENTE ?? 'https://via.placeholder.com/50',
                'is_admin' => $user->is_admin // Asegúrate de incluir este campo
            ]);
        } elseif (Auth::guard('estudiante')->check()) {
            $user = Auth::guard('estudiante')->user();
            return response()->json([
                'nombre' => $user->NOMBRE_EST,
                'apellido' => $user->APELLIDO_EST,
                'email' => $user->EMAIL_EST,
                'foto' => $user->FOTO_EST ?? 'https://via.placeholder.com/50',
                'is_rl' => $user->IS_RL
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
    // En AuthController.php

    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->input('role') === 'docente' && Docente::where('EMAIL_DOCENTE', $value)->exists()) {
                        $fail('El correo ya está registrado como docente.');
                    } elseif ($request->input('role') === 'estudiante' && Estudiante::where('EMAIL_EST', $value)->exists()) {
                        $fail('El correo ya está registrado como estudiante.');
                    }
                }
            ],
            'password' => 'required|string|min:8|confirmed',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'role' => 'required|in:docente,estudiante',
        ]);

        $imagePath = null;
        if ($request->hasFile('foto')) {
            $imagePath = $request->file('foto')->store('profile_photos', 'public');
        }

        if ($request->input('role') === 'docente') {
            $user = Docente::create([
                'NOMBRE_DOCENTE' => $request->input('nombre'),
                'APELLIDO_DOCENTE' => $request->input('apellido'),
                'EMAIL_DOCENTE' => $request->input('email'),
                'PASSWORD_DOCENTE' => Hash::make($request->input('password')),
                'FOTO_DOCENTE' => $imagePath,
                'is_admin' => 0,
                'approved' => false,
            ]);
        } else {
            $user = Estudiante::create([
                'NOMBRE_EST' => $request->input('nombre'),
                'APELLIDO_EST' => $request->input('apellido'),
                'EMAIL_EST' => $request->input('email'),
                'PASSWORD_EST' => Hash::make($request->input('password')),
                'FOTO_EST' => $imagePath,
                'IS_RL' => 0, // Por defecto
                'APPROVED' => false, // Establece el estado de aprobación por defecto
            ]);
        }

        return response()->json(['message' => 'Registro exitoso. Espera la aprobación del administrador.', 'user' => $user]);
    }
    public function deleteUser()
    {
        if (Auth::guard('docente')->check()) {
            $user = Auth::guard('docente')->user();
            Docente::where('ID_DOCENTE', $user->ID_DOCENTE)->delete();
        } elseif (Auth::guard('estudiante')->check()) {
            $user = Auth::guard('estudiante')->user();
            Estudiante::where('ID_EST', $user->ID_EST)->delete();
        } else {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        return response()->json(['message' => 'Cuenta eliminada exitosamente'], 200);
    }

    // Restablece la contraseña usando el token
}
