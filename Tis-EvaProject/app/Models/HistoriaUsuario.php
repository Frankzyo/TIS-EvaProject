<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriaUsuario extends Model
{
    use HasFactory;

    // Nombre de la tabla en la base de datos
    protected $table = 'historias_usuario';

    // Llave primaria
    protected $primaryKey = 'ID_HU';

    // Atributos asignables en masa
    protected $fillable = [
        'ID_GRUPO',
        'TITULO_HU',
        'DESCRIP_HU',
        'IMAGEN_HU',
        'COMENTARIO_HU',
        'PONDERACION_HU',
        'FECHACREACION_HU'
    ];

    // Deshabilitar timestamps automáticos si no los estás usando
    public $timestamps = false;

    // Si necesitas relaciones a futuro, aquí tienes ejemplos de posibles relaciones

    /**
     * Relación con el grupo al que pertenece la historia de usuario
     */
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'ID_GRUPO');
    }

    /**
     * Otras relaciones a futuro pueden añadirse aquí, 
     * dependiendo de las necesidades del sistema
     */
    public function tareas()
    {
        return $this->hasMany(TareaHu::class, 'ID_HU', 'ID_HU');
    }
}
