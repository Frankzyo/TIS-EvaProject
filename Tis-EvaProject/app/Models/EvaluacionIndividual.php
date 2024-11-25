<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionIndividual extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_individuales';
    protected $primaryKey = 'ID_EVALUACION';
    public $timestamps = true;

    protected $fillable = [
        'TITULO',
        'ID_GRUPO',
        'ID_ETAPA',
        'ID_PROYECTO',
    ];

    // Relaciones
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO');
    }

    public function etapa()
    {
        return $this->belongsTo(Etapa::class, 'ID_ETAPA');
    }

    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO');
    }
    public function fecha_defensa()
    {
        return $this->hasOne(FechaDefensa::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
