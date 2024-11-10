<?php

// app/Models/Grupo.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    use HasFactory;

    protected $table = 'grupo';
    protected $primaryKey = 'ID_GRUPO';
    public $incrementing = false; // Si usas claves alfanuméricas como UUID
    protected $fillable = ['ID_GRUPO', 'ID_DOCENTE', 'ID_PROYECTO', 'NOMBRE_GRUPO', 'DESCRIP_GRUPO', 'PORTADA_GRUPO'];

    // Relación con Proyecto
    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO');
    }

    // Relación con Docente
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'ID_DOCENTE');
    }
    public function requerimientos()
    {
        return $this->hasMany(Requerimiento::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
