<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionParEstudiante extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_pares_estudiantes';
    protected $primaryKey = 'id_evaluacion_estudiante';
    public $timestamps = true;

    protected $fillable = [
        'id_asignacion_par',
        'id_est',
        'comentarios',
        'calificacion',
    ];

    public function asignacionPar()
    {
        return $this->belongsTo(EvaluacionParGrupo::class, 'id_asignacion_par', 'id_asignacion_par');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_est', 'ID_EST');
    }
}
