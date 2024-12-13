<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionCruzada extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_cruzadas';

    protected $primaryKey = 'ID_EVAL_CRUZADA';

    public $timestamps = true;

    protected $fillable = [
        'ID_PROYECTO',
        'TITULO_EVAL_CRUZADA',
        'DESCRIPCION_EVAL_CRUZADA',
        'FECHA_INICIO_EVAL',
        'FECHA_FIN_EVAL',
        'PUNTUACION_TOTAL_EVAL'
    ];

    public function preguntas()
    {
        return $this->hasMany(PreguntaEvaluacionCruzada::class, 'ID_EVAL_CRUZADA');
    }

    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO');
    }
    public function resultados()
    {
        return $this->hasMany(ResultadoEvaluacionCruzada::class, 'ID_EVAL_CRUZADA');
    }
}
