<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FechaDefensa extends Model
{
    use HasFactory;

    protected $table = 'fechas_defensa';
    protected $primaryKey = 'ID_FECHADEF';

    protected $fillable = [
        'ID_PROYECTO',
        'ID_GRUPO',
        'HR_INIDEF',
        'HR_FINDEF',
        'day'
    ];

    public $timestamps = true;
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO', 'ID_GRUPO');
    }
}
