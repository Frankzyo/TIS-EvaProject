<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Providers\CustomDocenteUserProvider;
use App\Providers\CustomEstudianteUserProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->registerPolicies();

        // Registrar el proveedor personalizado para Docente
        Auth::provider('custom_docente', function ($app, array $config) {
            return new CustomDocenteUserProvider($app['hash'], $config['model']);
        });

        // Registrar el proveedor personalizado
        Auth::provider('custom_estudiante', function ($app, array $config) {
            return new CustomEstudianteUserProvider($app['hash'], $config['model']);
        });
    }
}
