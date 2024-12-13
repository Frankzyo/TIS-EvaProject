<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AutoevaluacionProyecto extends Model
{
    use HasFactory;

    protected $table = 'autoevaluaciones_proyecto';
    protected $primaryKey = 'ID_AUTOEVAL_PROYECTO';
    protected $fillable = [
        'ID_PROYECTO',
        'TITULO_AUTOEVAL',
        'DESCRIPCION_AUTOEVAL',
        'FECHA_INICIO_AUTOEVAL',
        'FECHA_FIN_AUTOEVAL',
        'PUNTUACION_TOTAL_AUTOEVAL',
    ];

    public function preguntas()
    {
        return $this->hasMany(PreguntaAutoevaluacion::class, 'ID_AUTOEVAL_PROYECTO');
    }
}
