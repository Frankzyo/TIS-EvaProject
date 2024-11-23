<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GrupoEstudiante extends Model
{
    use HasFactory;

    // Especifica la tabla asociada
    protected $table = 'GRUPO_ESTUDIANTE';

    // Define la clave primaria si es diferente a "id"
    protected $primaryKey = 'ID_GRUPO_ESTUDIANTE';

    // Desactiva timestamps si no los usas
    public $timestamps = true;

    // Define los campos que pueden ser asignados en masa
    protected $fillable = [
        'ID_GRUPO',
        'ID_ESTUDIANTE'
    ];
}
