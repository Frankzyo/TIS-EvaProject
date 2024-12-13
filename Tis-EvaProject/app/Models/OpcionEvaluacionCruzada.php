<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionEvaluacionCruzada extends Model
{
    use HasFactory;

    protected $table = 'opciones_pregunta_evaluacion_cruzada';

    protected $primaryKey = 'ID_OPCION_EVAL';

    public $timestamps = true;
    protected $keyType = 'int';
    protected $fillable = [
        'ID_PREGUNTA_EVAL',
        'TEXTO_OPCION_EVAL',
        'PUNTUACION_OPCION_EVAL'
    ];

    public function pregunta()
    {
        return $this->belongsTo(PreguntaEvaluacionCruzada::class, 'ID_PREGUNTA_EVAL');
    }
}
