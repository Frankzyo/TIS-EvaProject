<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckAdmin
{
    public function handle($request, Closure $next)
    {
        $user = Auth::guard('docente')->user();

        if (!$user || !$user->is_admin) {
            Log::info("Usuario sin permisos de administrador intentó acceder a una ruta protegida.");
            return response()->json(['error' => 'No tienes permisos para acceder a esta ruta'], 403);
        }

        return $next($request);
    }
}
