<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Docente extends Authenticatable
{
    protected $table = 'DOCENTE'; // El nombre de tu tabla en la base de datos
    protected $primaryKey = 'ID_DOCENTE'; // La clave primaria de tu tabla

    public $timestamps = false; // Deshabilitar timestamps

    protected $fillable = [
        'NOMBRE_DOCENTE', 'APELLIDO_DOCENTE', 'EMAIL_DOCENTE', 'PASSWORD_DOCENTE',
    ];

    protected $hidden = [
        'PASSWORD_DOCENTE',
    ];

    public function getAuthPassword()
    {
        return $this->PASSWORD_DOCENTE;
    }
}
