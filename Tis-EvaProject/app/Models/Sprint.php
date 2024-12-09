<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    // Tabla asociada
    protected $table = 'sprint';

    // Clave primaria
    protected $primaryKey = 'ID_SPRINT';

    // Indicamos que la clave primaria no es un incremento automático
    public $incrementing = false;

    // Tipo de clave primaria
    protected $keyType = 'string';

    // Deshabilitamos las marcas de tiempo automáticas
    public $timestamps = false;

    // Campos asignables en masa
    protected $fillable = [
        'ID_SPRINT',
        'ID_GRUPO',
        'NOMBRE_SPRINT',
        'FECHA_INICIO_SPRINT',
        'FECHA_FIN_SPRINT',
    ];

    // Relaciones
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
