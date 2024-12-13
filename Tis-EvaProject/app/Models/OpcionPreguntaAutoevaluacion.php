<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpcionPreguntaAutoevaluacion extends Model
{
    protected $table = 'opciones_pregunta_autoevaluacion';

    protected $primaryKey = 'ID_OPCION_AUTOEVAL'; // Especificar la clave primaria

    public $incrementing = true; // Si es AUTO_INCREMENT
    protected $keyType = 'int'; // Tipo de la clave primaria

    protected $fillable = [
        'ID_PREGUNTA_AUTOEVAL',
        'TEXTO_OPCION_AUTOEVAL',
        'PUNTUACION_OPCION_AUTOEVAL',
    ];
}
