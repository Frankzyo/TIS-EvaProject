<?php

return [

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'docente' => [
            'driver' => 'session',
            'provider' => 'docentes',
        ],
        'estudiante' => [
            'driver' => 'session',
            'provider' => 'estudiantes',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],
        'docentes' => [
            'driver' => 'custom_docente', // Usa el proveedor personalizado para Docentes
            'model' => App\Models\Docente::class,
        ],
        'estudiantes' => [
            'driver' => 'eloquent', // Usa el proveedor predeterminado para Estudiantes
            'model' => App\Models\Estudiante::class,
        ],
    ],

    'passwords' => [
        'docentes' => [
            'provider' => 'docentes',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
        'estudiantes' => [
            'provider' => 'estudiantes',
            'table' => 'password_resets',
            'expire' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),
];
