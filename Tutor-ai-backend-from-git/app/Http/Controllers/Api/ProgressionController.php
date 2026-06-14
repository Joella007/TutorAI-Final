<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Progression; // 👈 NOUVEAU : On utilise le modèle
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProgressionController extends Controller
{
    private function getUserId($user): int
    {
        return (int) ($user->id_utilisateur ?? $user->id);
    }

    /**
     * GET /api/progression
     */
    public function index(Request $request)
    {
        $userId = $this->getUserId($request->user());

        // 👈 CHANGEMENT MAJEUR : On utilise Progression::with au lieu de DB::table
        // Cela permet à Laravel de récupérer automatiquement le Titre du cours et la Matière !
        $progressions = Progression::with(['cours.chapitre.matiere'])
            ->where('id_utilisateur', $userId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $progressions->map(function ($row) {
                $progress = (float) $row->pourcentage;
                return [
                    'id_cours'         => $row->id_cours,
                    'progress'         => $progress,
                    'pourcentage'      => $progress,
                    'progression'      => $progress,
                    'date_mise_a_jour' => $row->date_mise_a_jour, // 👈 Indispensable pour le graphique de la semaine !
                    'cours'            => $row->cours,            // 👈 Indispensable pour la liste des cours récents !
                ];
            }),
        ]);
    }

    /**
     * GET /api/cours/{id}/progress
     */
    public function show(Request $request, int $id)
    {
        $userId = $this->getUserId($request->user());

        $row = DB::table('progression')
            ->where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        $progress = $row ? (float) $row->pourcentage : 0;

        return response()->json([
            'id_cours' => $id,
            'progress' => $progress,
            'pourcentage' => $progress,
            'progression' => $progress,
        ]);
    }

    /**
     * PUT /api/cours/{id}/progress
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'progress' => 'nullable|numeric|min:0|max:100',
            'pourcentage' => 'nullable|numeric|min:0|max:100',
            'progression' => 'nullable|numeric|min:0|max:100',
        ]);

        $userId = $this->getUserId($request->user());

        $progress = $request->input('progress', $request->input('pourcentage', $request->input('progression', 0)));
        $progress = max(0, min(100, (float) $progress));

        $existing = DB::table('progression')
            ->where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        $payload = [
            'pourcentage' => $progress,
            'date_mise_a_jour' => now(),
            'date_modification' => now()
        ];

        if ($existing) {
            DB::table('progression')
                ->where('id_utilisateur', $userId)
                ->where('id_cours', $id)
                ->update($payload);
        } else {
            $payload['id_utilisateur'] = $userId;
            $payload['id_cours'] = $id;
            DB::table('progression')->insert($payload);
        }

        // Met à jour l'inscription de l'étudiant à "terminé" s'il atteint 100%
        $inscription = DB::table('inscription_cours')
            ->where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        if (!$inscription) {
            DB::table('inscription_cours')->insert([
                'id_utilisateur' => $userId,
                'id_cours' => $id,
                'statut' => $progress == 100 ? 'termine' : 'en_cours',
                'date_inscription' => now(),
                'date_modification' => now()
            ]);
        } elseif ($progress == 100 && $inscription->statut !== 'termine') {
             DB::table('inscription_cours')
                 ->where('id_utilisateur', $userId)
                 ->where('id_cours', $id)
                 ->update(['statut' => 'termine', 'date_modification' => now()]);
        }

        return response()->json([
            'message' => 'Progression sauvegardée avec succès.',
            'id_cours' => $id,
            'progress' => $progress,
            'pourcentage' => $progress,
            'progression' => $progress,
        ]);
    }
}