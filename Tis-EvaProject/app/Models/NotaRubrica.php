<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotaRubrica extends Model
{
    use HasFactory;

    protected $table = 'notas_rubricas';

    protected $primaryKey = 'ID_NOTA_RUBRICA';

    public $timestamps = true;

    protected $fillable = [
        'ID_EVALUACION_INDIVIDUAL',
        'ID_RUBRICA',
        'PUNTUACION_OBTENIDA',
        'PUNTUACION_NO_AJUSTADA',
    ];

    // Relación con evaluaciones individuales
    public function evaluacionIndividual()
    {
        return $this->belongsTo(EvaluacionIndividualEstudiante::class, 'ID_EVALUACION_INDIVIDUAL', 'ID_EVALUACION_INDIVIDUAL');
    }

    // Relación con rúbricas
    public function rubrica()
    {
        return $this->belongsTo(Rubrica::class, 'ID_RUBRICA', 'ID_RUBRICA');
    }
    public function notasCriterios()
    {
        return $this->hasMany(NotaCriterio::class, 'ID_NOTA_RUBRICA', 'ID_NOTA_RUBRICA');
    }
}
