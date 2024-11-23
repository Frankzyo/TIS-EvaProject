<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TareaHu extends Model
{
    use HasFactory;

    protected $table = 'tareas_hu';
    protected $primaryKey = 'ID_TAREAHU';

    protected $fillable = [
        'ID_HU',
        'TITULO_TAREAHU',
        'ESTADO_TAREAHU',
        'RESPONSABLE_TAREAHU',
    ];

    public function historia()
    {
        return $this->belongsTo(HistoriaUsuario::class, 'ID_HU', 'ID_HU');
    }
}
