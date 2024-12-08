<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultadoAutoevaluacion extends Model
{
    use HasFactory;

    protected $table = 'resultados_autoevaluacion';

    protected $fillable = [
        'ID_AUTOEVAL_PROYECTO',
        'ID_GRUPO',
        'ID_EST',
        'NOMBRE_AUTOEVAL',
        'PUNTUACION_MAXIMA_AUTOEVAL',
        'PUNTUACION_OBTENIDA',
        'FECHA_INICIO',
    ];

    public $timestamps = false; // Si no estás usando campos created_at y updated_at

    public function autoevaluacion()
    {
        return $this->belongsTo(AutoevaluacionProyecto::class, 'ID_AUTOEVAL_PROYECTO');
    }
}
