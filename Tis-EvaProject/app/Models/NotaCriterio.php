<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotaCriterio extends Model
{
    use HasFactory;

    protected $table = 'nota_criterio';
    protected $primaryKey = 'ID_NOTA_CRITERIO';
    public $timestamps = true; // Usa created_at y updated_at automáticamente.

    // Definir columnas asignables en masa
    protected $fillable = [
        'ID_NOTA_RUBRICA',
        'ID_CRITERIO',
        'PUNTUACION_OBTENIDA',
        'PUNTUACION_NO_AJUSTADA',
    ];

    // Relación con NotaRubrica
    public function notaRubrica()
    {
        return $this->belongsTo(NotaRubrica::class, 'ID_NOTA_RUBRICA', 'ID_NOTA_RUBRICA');
    }

    // Relación con Criterio
    public function criterio()
    {
        return $this->belongsTo(Criterio::class, 'ID_CRITERIO', 'ID_CRITERIO');
    }
}
