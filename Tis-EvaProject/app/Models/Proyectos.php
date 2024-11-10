<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyectos extends Model
{
    use HasFactory;
    protected $table = 'proyecto';
    // Especifica los campos que pueden ser asignados masivamente
    protected $fillable = [
        'ID_PROYECTO',
        'NOMBRE_PROYECTO',
        'FECHA_INICIO_PROYECTO',
        'FECHA_FIN_PROYECTO',
        'DESCRIP_PROYECTO',
        'PORTADA_PROYECTO',
        'ID_DOCENTE'
    ];

    // Si la tabla no utiliza las marcas de tiempo por defecto (created_at, updated_at)
    public $timestamps = false;

    // Si el ID no es incremental (es varchar)
    protected $primaryKey = 'ID_PROYECTO';
    public $incrementing = false;
    protected $keyType = 'string';
    public function requerimientos()
    {
        return $this->hasMany(Requerimiento::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }
}
