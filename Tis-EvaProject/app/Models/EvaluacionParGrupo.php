<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluacionParGrupo extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones_pares_grupos'; // Nombre de la tabla
    protected $primaryKey = 'id_asignacion_par'; // Clave primaria personalizada
    public $incrementing = true; // Es autoincremental
    protected $keyType = 'int'; // Tipo de la clave primaria

    protected $fillable = [
        'id_evaluacion_par',
        'id_grupo_evaluador',
        'id_grupo_evaluado',
        'comentarios',
        'calificacion',
    ];

    // Relación con el grupo evaluador
    public function evaluacionPar()
    {
        return $this->belongsTo(EvaluacionPar::class, 'id_evaluacion_par', 'id_evaluacion_par');
    }

    public function grupoEvaluador()
    {
        return $this->belongsTo(Grupo::class, 'id_grupo_evaluador', 'ID_GRUPO');
    }

    public function grupoEvaluado()
    {
        return $this->belongsTo(Grupo::class, 'id_grupo_evaluado', 'ID_GRUPO');
    }

    public function estudiantesEvaluacion()
    {
        return $this->hasMany(EvaluacionParEstudiante::class, 'id_asignacion_par', 'id_asignacion_par');
    }

    public function enlaceProyecto()
    {
        return $this->hasOne(EnlaceProyecto::class, 'id_asignacion_par', 'id_asignacion_par');
    }
    public function evaluacion()
    {
        return $this->belongsTo(EvaluacionPar::class, 'id_evaluacion_par', 'id_evaluacion_par');
    }
    public function comentarios_y_notas(): HasMany
    {
        return $this->hasMany(EvaluacionParEstudiante::class, 'id_asignacion_par', 'id_asignacion_par');
    }
}
