<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    use HasFactory;

    protected $table = 'grupo';
    protected $primaryKey = 'ID_GRUPO';
    public $incrementing = true;
    protected $fillable = [
        'ID_GRUPO',
        'ID_DOCENTE',
        'ID_PROYECTO',
        'NOMBRE_GRUPO',
        'DESCRIP_GRUPO',
        'PORTADA_GRUPO',
        'CREADO_POR'
    ];

    // Relación con Proyecto
    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }

    // Relación con Docente
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'ID_DOCENTE', 'ID_DOCENTE');
    }

    // Relación con Requerimientos
    public function requerimientos()
    {
        return $this->hasMany(Requerimiento::class, 'ID_GRUPO', 'ID_GRUPO');
    }

    // Relación con Estudiantes Generales (directa)
    public function estudiantes()
    {
        return $this->hasMany(Estudiante::class, 'ID_GRUPO', 'ID_GRUPO');
    }

    // Relación con el Representante Legal (tabla intermedia)
    public function representanteLegal()
    {
        return $this->belongsToMany(Estudiante::class, 'grupo_estudiante', 'ID_GRUPO', 'ID_ESTUDIANTE')
            ->wherePivot('IS_RL', 1); // Filtrar solo el representante legal
    }

    // Relación con Fechas de Defensa
    public function fechasDefensa()
    {
        return $this->hasMany(FechaDefensa::class, 'ID_GRUPO', 'ID_GRUPO');
    }
    public function evaluacionesComoEvaluador()
    {
        return $this->hasMany(EvaluacionParGrupo::class, 'id_grupo_evaluador');
    }

    public function evaluacionesComoEvaluado()
    {
        return $this->hasMany(EvaluacionParGrupo::class, 'id_grupo_evaluado');
    }
}
