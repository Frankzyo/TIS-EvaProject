<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Estudiante extends Authenticatable
{
    protected $table = 'ESTUDIANTE'; // El nombre de tu tabla en la base de datos
    protected $primaryKey = 'ID_EST'; // La clave primaria de tu tabla

    public $timestamps = false; // Deshabilitar timestamps

    protected $fillable = [
        'NOMBRE_EST', 'APELLIDO_EST', 'EMAIL_EST', 'PASSWORD_EST',
    ];

    protected $hidden = [
        'PASSWORD_EST',
    ];

    public function getAuthPassword()
    {
        return $this->PASSWORD_EST;
    }
}
