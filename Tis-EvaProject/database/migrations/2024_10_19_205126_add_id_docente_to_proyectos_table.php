<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('PROYECTO', function (Blueprint $table) {
            // Solo agregar la columna si no existe
            if (!Schema::hasColumn('PROYECTO', 'ID_DOCENTE')) {
                $table->string('ID_DOCENTE')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PROYECTO', function (Blueprint $table) {
            // Eliminar la columna ID_DOCENTE si existe
            if (Schema::hasColumn('PROYECTO', 'ID_DOCENTE')) {
                $table->dropColumn('ID_DOCENTE');
            }
        });
    }
};
