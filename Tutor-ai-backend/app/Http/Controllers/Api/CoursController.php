<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoursResource;
use App\Models\Cours;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CoursController extends Controller
{
    /**
     * GET /api/cours
     */
    public function index(Request $request)
    {
        $likeOperator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        $query = Cours::query()
            ->with([
                'chapitre:id_chapitre,titre,id_matiere,id_filiere',
                'chapitre.matiere:id_matiere,nom_matiere',
                'chapitre.filiere:id_filiere,nom_filiere,id_niveau',
            ]);

        // 1. Filtrer STRICTEMENT par Filière (Classe)
        if ($request->filled('id_filiere') && $request->input('id_filiere') !== 'Toutes') {
            $query->whereHas('chapitre', function ($q) use ($request) {
                $q->where('id_filiere', $request->input('id_filiere'));
            });
        } 
        // 2. Sinon, filtrer par Niveau (Pour le collège par exemple)
        elseif ($request->filled('id_niveau')) {
            $query->whereHas('chapitre.filiere', function ($q) use ($request) {
                $q->where('id_niveau', $request->input('id_niveau'));
            });
        }

        // Filtre par matière
        if ($request->filled('matiere') && $request->input('matiere') !== 'Toutes') {
            $matiere = $request->input('matiere');
            $query->whereHas('chapitre.matiere', function ($q) use ($matiere) {
                if (is_numeric($matiere)) {
                    $q->where('id_matiere', $matiere);
                } else {
                    $q->where('nom_matiere', $matiere);
                }
            });
        }

        // Recherche textuelle
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('titre', $likeOperator, '%' . $search . '%')
                    ->orWhere('description', $likeOperator, '%' . $search . '%')
                    ->orWhereHas('chapitre.matiere', function ($mq) use ($search, $likeOperator) {
                        $mq->where('nom_matiere', $likeOperator, '%' . $search . '%');
                    });
            });
        }

        $perPage = max(1, min((int) $request->input('per_page', 12), 50));
        $cours = $query->orderBy('date_creation', 'desc')->paginate($perPage);

        return CoursResource::collection($cours);
    }

    /**
     * GET /api/cours/{id}
     */
    public function show($id)
    {
        $cours = Cours::with([
            'chapitre.matiere',
            'chapitre.filiere',
            'chapitre.lecons',
            'exercices',
        ])->findOrFail($id);

        return new CoursResource($cours);
    }

    /**
     * GET /api/cours/recommandes
     */
    public function recommandes(Request $request)
    {
        $user = $request->user();

        // On exclut les cours où l'étudiant est déjà inscrit
        $coursInscrits = DB::table('inscription_cours')
            ->where('id_utilisateur', $user->id_utilisateur)
            ->pluck('id_cours');

        $query = Cours::with([
            'chapitre.matiere',
            'chapitre.filiere',
        ])->whereNotIn('id_cours', $coursInscrits);

        // 👈 LE FIX EST ICI : On recommande UNIQUEMENT les cours de la filière de l'étudiant !
        if ($user->id_filiere) {
            $query->whereHas('chapitre', function ($q) use ($user) {
                $q->where('id_filiere', $user->id_filiere);
            });
        } elseif ($user->id_niveau) {
            $query->whereHas('chapitre.filiere', function ($q) use ($user) {
                $q->where('id_niveau', $user->id_niveau);
            });
        }

        $cours = $query->orderBy('date_creation', 'desc')
                       ->limit(6)
                       ->get();

        return CoursResource::collection($cours);
    }
}