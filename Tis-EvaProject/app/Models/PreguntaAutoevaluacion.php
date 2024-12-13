<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreguntaAutoevaluacion extends Model
{
    use HasFactory;

    protected $table = 'preguntas_autoevaluacion';
    protected $primaryKey = 'ID_PREGUNTA_AUTOEVAL';

    protected $fillable = [
        'ID_AUTOEVAL_PROYECTO',
        'PREGUNTA_AUTOEVAL',
    ];

    public function autoevaluacion()
    {
        return $this->belongsTo(AutoevaluacionProyecto::class, 'ID_AUTOEVAL_PROYECTO');
    }

    public function opciones()
    {
        return $this->hasMany(OpcionPreguntaAutoevaluacion::class, 'ID_PREGUNTA_AUTOEVAL');
    }
}
