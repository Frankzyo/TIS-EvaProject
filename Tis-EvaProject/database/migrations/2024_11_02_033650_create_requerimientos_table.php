<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('requerimientos', function (Blueprint $table) {
            $table->id('ID_REQUERIMIENTO');
            $table->unsignedBigInteger('ID_PROYECTO');
            $table->string('DESCRIPCION', 1000);
            $table->timestamps();

            // Llave foránea para relacionar con la tabla proyectos
            $table->foreign('ID_PROYECTO')->references('ID_PROYECTO')->on('proyectos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requerimientos');
    }
};
