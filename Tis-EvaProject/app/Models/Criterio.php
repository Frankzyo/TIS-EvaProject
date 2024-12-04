<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Criterio extends Model
{
    use HasFactory;

    protected $table = 'criterios';
    public $timestamps = false;
    protected $primaryKey = 'ID_CRITERIO';
    public $incrementing = true;

    protected $fillable = [
        'ID_RUBRICA',
        'NOMBRE_CRITERIO',
        'DESCRIPCION_CRITERIO',
        'PESO_CRITERIO',
    ];

    public function rubrica()
    {
        return $this->belongsTo(Rubrica::class, 'ID_RUBRICA');
    }

    public function niveles()
    {
        return $this->hasMany(Nivel::class, 'ID_CRITERIO', 'ID_CRITERIO');
    }
    public function notasCriterios()
    {
        return $this->hasMany(NotaCriterio::class, 'ID_CRITERIO', 'ID_CRITERIO');
    }
}
