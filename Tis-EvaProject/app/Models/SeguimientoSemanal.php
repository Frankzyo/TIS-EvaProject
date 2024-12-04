<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeguimientoSemanal extends Model
{
    use HasFactory;

    protected $table = 'seguimiento_semanal'; // Nombre de la tabla
    protected $primaryKey = 'ID_SEGUIMIENTO'; // Llave primaria
    public $timestamps = true; // created_at y updated_at

    protected $fillable = [
        'ID_PROYECTO',
        'ID_GRUPO',
        'FECHA_REVISION',
        'REVISO_ACTUAL',
        'REVISARA_SIGUIENTE',
    ];
}
