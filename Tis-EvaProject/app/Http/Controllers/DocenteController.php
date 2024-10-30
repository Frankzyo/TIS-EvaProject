<?php

namespace App\Http\Controllers;

use App\Models\Proyectos;
use Auth;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    public function show($id)
    {
        $proyecto = Proyectos::find($id);

        if (!$proyecto) {
            return response()->json(['error' => 'Proyecto no encontrado'], 404);
        }

        return response()->json($proyecto);

    }

}
