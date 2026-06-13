<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatiereController extends Controller
{
    public function index()
    {
        $matieres = Matiere::query()
            ->orderBy('nom_matiere')
            ->get();

        return response()->json([
            'data' => $matieres->map(fn ($m) => [
                'id' => $m->id_matiere,
                'id_matiere' => $m->id_matiere,
                'name' => $m->nom_matiere,
                'nom_matiere' => $m->nom_matiere,
            ]),
        ]);
    }

    // public function disponibles(Request $request)
    // {
    //     // ── Filtrage depuis les relations directes ──
    //     $query = DB::table('matiere')
    //         ->select('matiere.id_matiere', 'matiere.nom_matiere')
    //         ->distinct();

    //     $hasFilters = false;

    //     // 1. Filtrer par Filière/Classe (Ex: Terminale S)
    //     if ($request->filled('id_filiere')) {
    //         $hasFilters = true;
    //         $query->join('filiere_matiere', 'matiere.id_matiere', '=', 'filiere_matiere.id_matiere')
    //               ->where('filiere_matiere.id_filiere', $request->input('id_filiere'));
    //     } 
    //     // 2. Sinon, Filtrer par Niveau (Ex: Collège)
    //     elseif ($request->filled('id_niveau')) {
    //         $hasFilters = true;
    //         $query->join('niveau_matiere', 'matiere.id_matiere', '=', 'niveau_matiere.id_matiere')
    //               ->where('niveau_matiere.id_niveau', $request->input('id_niveau'));
    //     }

    //     $matieres = $query->orderBy('matiere.nom_matiere')->get();

    //     // ── SÉCURITÉ (FALLBACK) ──
    //     // Si les tables pivots (filiere_matiere / niveau_matiere) n'ont pas encore été remplies
    //     // dans la base de données, on utilise votre ancienne logique : on charge les matières qui ont des cours !
    //     if ($matieres->isEmpty()) {
            
    //         $niveauMap = [
    //             1 => ['Collège'],
    //             2 => ['Lycée'],
    //             3 => ['Université'],
    //         ];

    //         $fallbackQuery = DB::table('matiere')
    //             ->join('chapitre', 'chapitre.id_matiere', '=', 'matiere.id_matiere')
    //             ->join('cours', 'cours.id_chapitre', '=', 'chapitre.id_chapitre')
    //             ->select('matiere.id_matiere', 'matiere.nom_matiere')
    //             ->distinct(); // Le distinct ici élimine les doublons liés aux multiples chapitres

    //         if ($request->filled('id_niveau')) {
    //             $idNiveau = (int) $request->input('id_niveau');
    //             $niveauxCours = $niveauMap[$idNiveau] ?? [];
    //             if (!empty($niveauxCours)) {
    //                 $fallbackQuery->whereIn('cours.niveau', $niveauxCours);
    //             }
    //         }

    //         if ($request->filled('id_filiere')) {
    //             $fallbackQuery->where('chapitre.id_filiere', $request->input('id_filiere'));
    //         }

    //         $matieres = $fallbackQuery->orderBy('matiere.nom_matiere')->get();
            
    //         // Dernière sécurité : Si vraiment tout est vide, on renvoie toutes les matières
    //         if ($matieres->isEmpty()) {
    //             $matieres = DB::table('matiere')->select('id_matiere', 'nom_matiere')->orderBy('nom_matiere')->get();
    //         }
    //     }

    //     // Le formatage correct et final (sans créer de sous-tableaux imbriqués)
    //     return response()->json([
    //         'data' => $matieres->map(fn ($m) => [
    //             'id' => $m->id_matiere,
    //             'id_matiere' => $m->id_matiere,
    //             'name' => $m->nom_matiere,
    //             'nom_matiere' => $m->nom_matiere,
    //         ]),
    //     ]);
    // }
        public function disponibles(Request $request)
    {
        // ── Filtrage depuis les relations directes ──
        $query = DB::table('matiere')
            ->select('matiere.id_matiere', 'matiere.nom_matiere');

        // 1. Filtrer par Filière/Classe (Ex: Terminale S)
        if ($request->filled('id_filiere')) {
            $query->join('filiere_matiere', 'matiere.id_matiere', '=', 'filiere_matiere.id_matiere')
                  ->where('filiere_matiere.id_filiere', $request->input('id_filiere'));
        } 
        // 2. Sinon, Filtrer par Niveau (Ex: Collège)
        elseif ($request->filled('id_niveau')) {
            $query->join('niveau_matiere', 'matiere.id_matiere', '=', 'niveau_matiere.id_matiere')
                  ->where('niveau_matiere.id_niveau', $request->input('id_niveau'));
        }

        $matieres = $query->orderBy('matiere.nom_matiere')->get();

        // ── SÉCURITÉ (FALLBACK) ──
        if ($matieres->isEmpty()) {
            
            $niveauMap = [
                1 => ['Collège'],
                2 => ['Lycée'],
                3 => ['Université'],
            ];

            $fallbackQuery = DB::table('matiere')
                ->join('chapitre', 'chapitre.id_matiere', '=', 'matiere.id_matiere')
                ->join('cours', 'cours.id_chapitre', '=', 'chapitre.id_chapitre')
                ->select('matiere.id_matiere', 'matiere.nom_matiere');

            if ($request->filled('id_niveau')) {
                $idNiveau = (int) $request->input('id_niveau');
                $niveauxCours = $niveauMap[$idNiveau] ?? [];
                if (!empty($niveauxCours)) {
                    $fallbackQuery->whereIn('cours.niveau', $niveauxCours);
                }
            }

            if ($request->filled('id_filiere')) {
                $fallbackQuery->where('chapitre.id_filiere', $request->input('id_filiere'));
            }

            $matieres = $fallbackQuery->orderBy('matiere.nom_matiere')->get();
            
            if ($matieres->isEmpty()) {
                $matieres = DB::table('matiere')->select('id_matiere', 'nom_matiere')->orderBy('nom_matiere')->get();
            }
        }

        // ── LE FILTRE MAGIQUE ANTI-DOUBLONS ──
        // On supprime tous les doublons basés sur le texte "nom_matiere" (insensible à la casse)
        $matieresUniques = $matieres->unique(function ($item) {
            return mb_strtolower(trim($item->nom_matiere));
        });

        // Le formatage correct
        return response()->json([
            'data' => $matieresUniques->values()->map(fn ($m) => [
                'id' => $m->id_matiere,
                'id_matiere' => $m->id_matiere,
                'name' => $m->nom_matiere,
                'nom_matiere' => $m->nom_matiere,
            ]),
        ]);
    }
}