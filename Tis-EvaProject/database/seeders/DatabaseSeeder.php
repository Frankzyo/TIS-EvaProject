<?php

namespace Database\Seeders;

use App\Models\Docente;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use DB;
use Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('DOCENTE')->insert([
            'ID_DOCENTE' => '3', // Cambia según sea necesario
            'NOMBRE_DOCENTE' => 'Juan',
            'APELLIDO_DOCENTE' => 'Pérez',
            'EMAIL_DOCENTE' => 'juan@gmail.com',
            'PASSWORD_DOCENTE' => Hash::make('tu_password'), // Utiliza PASSWORD_DOCENTE
            'FOTO_DOCENTE' => 'profile_photos/HofsNfXMYyxJvaGWWSRXYQlMLigQJGODr94VULXA.png',
        ]);

    }
}
