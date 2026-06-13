<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NiveauController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('niveau');

        // Filtrer par cycle si demandé
        if ($request->has('id_cycle')) {
            $query->where('id_cycle', $request->input('id_cycle'));
        }

        $niveaux = $query->orderBy('ordre_affichage', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $niveaux
        ]);
    }
}