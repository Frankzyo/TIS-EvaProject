<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultadoEvaluacionCruzada extends Model
{
    use HasFactory;

    protected $table = 'resultados_evaluacion_cruzada';

    protected $primaryKey = 'ID_RESULTADO_CRUZADA';

    public $timestamps = true;

    protected $fillable = [
        'ID_EVAL_CRUZADA',
        'ID_EST_EVALUADOR',
        'ID_EST_EVALUADO',
        'PUNTUACION_OBTENIDA',
    ];

    // Relación con EvaluacionCruzada
    public function evaluacionCruzada()
    {
        return $this->belongsTo(EvaluacionCruzada::class, 'ID_EVAL_CRUZADA');
    }

    // Relación con Estudiante (Evaluador)
    public function evaluador()
    {
        return $this->belongsTo(Estudiante::class, 'ID_EST_EVALUADOR');
    }

    // Relación con Estudiante (Evaluado)
    public function evaluado()
    {
        return $this->belongsTo(Estudiante::class, 'ID_EST_EVALUADO');
    }
}
