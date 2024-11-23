<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nivel extends Model
{
    use HasFactory;

    protected $table = 'niveles';
    public $timestamps = false;
    protected $primaryKey = 'ID_NIVEL';
    public $incrementing = true;

    protected $fillable = [
        'ID_CRITERIO',
        'TITULO_NIVEL',
        'DESCRIPCION_NIVEL',
        'PUNTOS',
    ];

    public function criterio()
    {
        return $this->belongsTo(Criterio::class, 'ID_CRITERIO');
    }
}
