<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpcionPreguntaAutoevaluacion extends Model
{
    use HasFactory;

    protected $table = 'opciones_pregunta_autoevaluacion';

    protected $fillable = [
        'ID_PREGUNTA_AUTOEVAL',
        'TEXTO_OPCION_AUTOEVAL',
        'PUNTUACION_OPCION_AUTOEVAL',
    ];

    public function pregunta()
    {
        return $this->belongsTo(PreguntaAutoevaluacion::class, 'ID_PREGUNTA_AUTOEVAL');
    }
}
