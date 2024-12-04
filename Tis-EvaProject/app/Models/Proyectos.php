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
        'ID_DOCENTE',
    ];

    // Si la tabla no utiliza las marcas de tiempo por defecto (created_at, updated_at)
    public $timestamps = false;

    // Si el ID no es incremental (es varchar)
    protected $primaryKey = 'ID_PROYECTO';
    public $incrementing = false;
    protected $keyType = 'string';

    // Castear los campos de fecha para manejarlos como instancias de Carbon
    protected $casts = [
        'FECHA_INICIO_PROYECTO' => 'datetime:Y-m-d', // Formato 'año-mes-día'
        'FECHA_FIN_PROYECTO' => 'datetime:Y-m-d',
    ];

    // Relación con los requerimientos
    public function requerimientos()
    {
        return $this->hasMany(Requerimiento::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }

    // Relación con el docente
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'ID_DOCENTE', 'ID_DOCENTE');
    }

    // Relación con los grupos
    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }

    // Relación con las etapas
    public function etapas()
    {
        return $this->hasMany(Etapa::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }
    public function evaluacionesPares()
    {
        return $this->hasMany(EvaluacionPar::class, 'id_proyecto');
    }
}
