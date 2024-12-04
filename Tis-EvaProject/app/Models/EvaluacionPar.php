<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluacionPar extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_pares'; // Nombre de la tabla
    protected $primaryKey = 'id_evaluacion_par'; // Clave primaria personalizada
    public $incrementing = true; // Es autoincremental
    protected $keyType = 'int'; // Tipo de la clave primaria

    protected $fillable = [
        'id_proyecto',
        'fecha_inicio',
        'fecha_fin',
        'nota_maxima',
    ];

    // Relación con EvaluacionParGrupo
    public function gruposEvaluadores()
    {
        return $this->hasMany(EvaluacionParGrupo::class, 'id_evaluacion_par', 'id_evaluacion_par')
            ->with('grupoEvaluador');
    }

    public function gruposEvaluados()
    {
        return $this->hasMany(EvaluacionParGrupo::class, 'id_evaluacion_par', 'id_evaluacion_par')
            ->with('grupoEvaluado');
    }
}
