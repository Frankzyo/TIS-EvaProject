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
        Schema::table('requerimientos', function (Blueprint $table) {
            $table->string('creado_por', 50)->nullable()->after('ID_GRUPO');
        });
    }

    public function down()
    {
        Schema::table('requerimientos', function (Blueprint $table) {
            $table->dropColumn('creado_por');
        });
    }
};
