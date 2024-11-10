<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Verifica si el correo existe en DOCENTE o ESTUDIANTE
        $docente = DB::table('DOCENTE')->where('EMAIL_DOCENTE', $request->email)->first();
        $estudiante = DB::table('ESTUDIANTE')->where('EMAIL_EST', $request->email)->first();

        if (!$docente && !$estudiante) {
            return response()->json(['message' => 'El correo electrónico ingresado no está registrado en el sistema.'], 422);
        }

        // Verifica si ya existe un registro en `password_resets` para este correo
        $lastReset = DB::table('password_resets')->where('email', $request->email)->first();

        if ($lastReset) {
            // Calcula la diferencia en minutos desde la última solicitud de restablecimiento
            $minutesSinceLastReset = Carbon::parse($lastReset->created_at)->diffInMinutes(Carbon::now());

            // Si ha pasado menos de 5 minutos, bloquea la nueva solicitud
            if ($minutesSinceLastReset < 5) {
                return response()->json(['message' => 'Ya se ha enviado un enlace de recuperación recientemente. Intente de nuevo en unos minutos.'], 429);
            }
        }

        // Genera un token único para el restablecimiento de contraseña
        $token = Str::random(60);

        // Guarda o actualiza el token en la tabla `password_resets`
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Envía el correo con el enlace de restablecimiento
        $resetLink = url("/reset-password?token=$token&email=" . urlencode($request->email));
        Mail::send('emails.password_reset', ['link' => $resetLink], function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Restablecimiento de Contraseña');
        });

        return response()->json(['message' => 'Se ha enviado un enlace de recuperación a tu correo.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Busca el registro de restablecimiento en la tabla `password_resets`
        $passwordReset = DB::table('password_resets')->where('email', $request->email)->first();

        // Verifica si el token es válido
        if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
            return response()->json(['message' => 'Token de restablecimiento de contraseña inválido o expirado.'], 400);
        }

        // Verifica si el token ha expirado (opcional)
        $tokenValid = Carbon::parse($passwordReset->created_at)->addMinutes(60)->isFuture();
        if (!$tokenValid) {
            return response()->json(['message' => 'El token ha expirado.'], 400);
        }

        // Actualiza la contraseña en la tabla correspondiente
        $docente = DB::table('DOCENTE')->where('EMAIL_DOCENTE', $request->email)->first();
        $estudiante = DB::table('ESTUDIANTE')->where('EMAIL_EST', $request->email)->first();

        if ($docente) {
            DB::table('DOCENTE')->where('EMAIL_DOCENTE', $request->email)->update([
                'PASSWORD_DOCENTE' => Hash::make($request->password)
            ]);
        } elseif ($estudiante) {
            DB::table('ESTUDIANTE')->where('EMAIL_EST', $request->email)->update([
                'PASSWORD_EST' => Hash::make($request->password)
            ]);
        }

        // Elimina el registro de restablecimiento de la tabla `password_resets`
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'La contraseña se ha restablecido con éxito.'], 200);
    }
}
