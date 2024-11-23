<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Model;

class Docente extends Authenticatable
{
    protected $table = 'docente';
    // El nombre de tu tabla en la base de datos
    protected $primaryKey = 'ID_DOCENTE'; // La clave primaria de tu tabla

    public $timestamps = false; // Deshabilitar timestamps

    protected $fillable = [
        'NOMBRE_DOCENTE',
        'APELLIDO_DOCENTE',
        'EMAIL_DOCENTE',
        'PASSWORD_DOCENTE',
        'FOTO_DOCENTE',
        'is_admin',  // Añade esta línea
    ];

    protected $hidden = [
        'PASSWORD_DOCENTE',
    ];

    public function getAuthPassword()
    {
        return $this->PASSWORD_DOCENTE;
    }
    public function isAdmin()
    {
        return $this->is_admin;
    }
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
    public function getEmailForPasswordReset()
{
    return $this->EMAIL_DOCENTE;
}

}
