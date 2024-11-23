<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rubrica extends Model
{
    use HasFactory;

    protected $table = 'rubricas';
    public $timestamps = false;
    protected $primaryKey = 'ID_RUBRICA';
    public $incrementing = true; // Cambiado a true
    protected $keyType = 'int';

    protected $fillable = [
        'NOMBRE_RUBRICA',
        'DESCRIPCION_RUBRICA',
        'PESO_RUBRICA',
        'ID_PROYECTO',
        'ID_ETAPA',
    ];

    public function criterios()
    {
        return $this->hasMany(Criterio::class, 'ID_RUBRICA', 'ID_RUBRICA');
    }
}
