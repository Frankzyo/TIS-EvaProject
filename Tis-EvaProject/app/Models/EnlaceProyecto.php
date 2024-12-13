<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnlaceProyecto extends Model
{
    use HasFactory;

    protected $table = 'enlaces_proyectos';
    protected $primaryKey = 'id_enlace_proyecto';
    public $timestamps = true;

    protected $fillable = [
        'id_asignacion_par',
        'link_proyecto',
    ];

    public function asignacionPar()
    {
        return $this->belongsTo(EvaluacionParGrupo::class, 'id_asignacion_par', 'id_asignacion_par');
    }
}
