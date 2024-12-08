<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreguntaEvaluacionCruzada extends Model
{
    use HasFactory;

    protected $table = 'preguntas_evaluacion_cruzada';

    protected $primaryKey = 'ID_PREGUNTA_EVAL';

    public $timestamps = true;

    protected $fillable = [
        'ID_EVAL_CRUZADA',
        'PREGUNTA_EVAL'
    ];

    public function opciones()
    {
        return $this->hasMany(OpcionEvaluacionCruzada::class, 'ID_PREGUNTA_EVAL');
    }

    public function evaluacion()
    {
        return $this->belongsTo(EvaluacionCruzada::class, 'ID_EVAL_CRUZADA');
    }
}
