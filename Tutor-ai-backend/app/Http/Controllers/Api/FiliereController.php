<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FiliereController extends Controller
{
    /**
     * GET /api/filieres
     */
    public function index(Request $request)
    {
        $query = DB::table('filiere');

        // Si le frontend demande les filières pour un niveau précis
        if ($request->has('id_niveau')) {
            $query->where('id_niveau', $request->input('id_niveau'));
        }

        $filieres = $query->orderBy('ordre_affichage', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $filieres
        ]);
    }
}