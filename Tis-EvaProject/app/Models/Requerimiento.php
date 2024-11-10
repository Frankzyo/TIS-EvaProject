<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requerimiento extends Model
{
    use HasFactory;

    protected $table = 'requerimientos';
    protected $primaryKey = 'ID_REQUERIMIENTO'; // Especifica la clave primaria correcta
    public $timestamps = true; // Activa los timestamps si están presentes

    protected $fillable = [
        'ID_PROYECTO',
        'ID_GRUPO',
        'DESCRIPCION_REQ',
        'creado_por'
    ];
    

    public function proyecto()
    {
        return $this->belongsTo(Proyectos::class, 'ID_PROYECTO', 'ID_PROYECTO');
    }
}
