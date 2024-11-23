<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etapa extends Model
{
    use HasFactory;

    protected $table = 'etapas';
    protected $primaryKey = 'ID_ETAPA'; // Especifica la clave primaria

    protected $fillable = [
        'ID_PROYECTO',
        'ETAPAS_TITULO',
        'ETAPAS_DESCRIPCION',
        'ETAPAS_PUNTUACION',
        'ETAPAS_DURACION'
    ];

    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO');
    }
}
