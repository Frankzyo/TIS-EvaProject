<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionIndividualEstudiante extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_individuales_estudiante';

    protected $primaryKey = 'ID_EVALUACION_INDIVIDUAL';

    public $timestamps = true;

    protected $fillable = [
        'ID_ESTUDIANTE',
        'ID_ETAPA',
        'ID_GRUPO',
        'FECHA_REVISION',
        'PUNTUACION_TOTAL',
        'PUNTUACION_NO_AJUSTADA',
        'FALTA',
        'RETRASO',
    ];

    // Relación con las notas de rúbricas
    public function notasRubricas()
    {
        return $this->hasMany(NotaRubrica::class, 'ID_EVALUACION_INDIVIDUAL', 'ID_EVALUACION_INDIVIDUAL');
    }

    // Relación con estudiantes
    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'ID_ESTUDIANTE', 'ID_EST');
    }

    // Relación con etapas
    public function etapa()
    {
        return $this->belongsTo(Etapa::class, 'ID_ETAPA', 'ID_ETAPA');
    }

    // Relación con grupos
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
