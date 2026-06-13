<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoursResource;
use App\Models\Cours;
use App\Models\InscriptionCours;
use App\Models\Progression;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StudentCoursesController extends Controller
{
    private function getUserId($user): int
    {
        return (int) ($user->id_utilisateur ?? $user->id);
    }

    private function normalizeProgress($value): float
    {
        $progress = is_numeric($value) ? (float) $value : 0;

        return max(0, min(100, $progress));
    }

    private function getProgressFromProgression($progression): float
    {
        if (!$progression) {
            return 0;
        }

        return $this->normalizeProgress(
            $progression->pourcentage
                ?? $progression->progress
                ?? $progression->progression
                ?? 0
        );
    }

    private function getProgressFromInscription($inscription): float
    {
        if (!$inscription) {
            return 0;
        }

        return $this->normalizeProgress(
            $inscription->pourcentage
                ?? $inscription->progress
                ?? $inscription->progression
                ?? 0
        );
    }

    private function getCourseProgress(int $userId, int $courseId, $inscription = null): float
    {
        $progression = Progression::where('id_utilisateur', $userId)
            ->where('id_cours', $courseId)
            ->first();

        if ($progression) {
            return $this->getProgressFromProgression($progression);
        }

        return $this->getProgressFromInscription($inscription);
    }

    /**
     * GET /api/user/courses
     *
     * Retourne tous les cours auxquels l'utilisateur connecté est inscrit.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié',
            ], 401);
        }

        $userId = $this->getUserId($user);

        $inscriptionTable = (new InscriptionCours())->getTable();

        $query = InscriptionCours::where('id_utilisateur', $userId)
            ->with([
                'cours.chapitre.matiere',
                'cours.chapitre.filiere',
            ]);

        if (Schema::hasColumn($inscriptionTable, 'date_inscription')) {
            $query->orderByDesc('date_inscription');
        }

        $inscriptions = $query->get();

        $progressions = Progression::where('id_utilisateur', $userId)
            ->get()
            ->keyBy('id_cours');

        $coursesWithProgress = $inscriptions
            ->filter(function ($inscription) {
                return $inscription->cours !== null;
            })
            ->map(function ($inscription) use ($progressions, $request) {
                $cours = $inscription->cours;

                $progression = $progressions->get($cours->id_cours);

                $progress = $progression
                    ? $this->getProgressFromProgression($progression)
                    : $this->getProgressFromInscription($inscription);

                $resource = new CoursResource($cours);
                $data = $resource->toArray($request);

                $data['id_cours'] = $cours->id_cours;
                $data['progress'] = $progress;
                $data['pourcentage'] = $progress;
                $data['progression'] = $progress;
                $data['isEnrolled'] = true;
                $data['date_inscription'] = $inscription->date_inscription ?? null;
                $data['statut_inscription'] = $inscription->statut ?? null;

                return $data;
            })
            ->values();

        return response()->json($coursesWithProgress);
    }

    /**
     * GET /api/user/courses/{id}
     *
     * Retourne un cours inscrit avec détails.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié',
            ], 401);
        }

        $userId = $this->getUserId($user);

        $inscription = InscriptionCours::where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        if (!$inscription) {
            return response()->json([
                'message' => 'Cours introuvable ou utilisateur non inscrit',
            ], 404);
        }

        $cours = Cours::with([
            'chapitre.matiere',
            'chapitre.filiere',
            'chapitre.lecons',
            'exercices',
        ])->findOrFail($id);

        $progress = $this->getCourseProgress($userId, (int) $id, $inscription);

        $resource = new CoursResource($cours);
        $data = $resource->toArray($request);

        $data['id_cours'] = $cours->id_cours;
        $data['progress'] = $progress;
        $data['pourcentage'] = $progress;
        $data['progression'] = $progress;
        $data['isEnrolled'] = true;
        $data['date_inscription'] = $inscription->date_inscription ?? null;
        $data['statut_inscription'] = $inscription->statut ?? null;

        return response()->json($data);
    }

    /**
     * POST /api/user/courses/{id}/enroll
     *
     * Inscrit l'utilisateur connecté à un cours.
     * Si l'utilisateur est déjà inscrit, on retourne OK au lieu d'une erreur.
     */
    public function enroll(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur non authentifié',
            ], 401);
        }

        $userId = $this->getUserId($user);

        $cours = Cours::find($id);

        if (!$cours) {
            return response()->json([
                'message' => 'Cours introuvable',
            ], 404);
        }

        $inscription = InscriptionCours::where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        if ($inscription) {
            $progress = $this->getCourseProgress($userId, (int) $id, $inscription);

            return response()->json([
                'success' => true,
                'already_enrolled' => true,
                'message' => 'Déjà inscrit à ce cours',
                'id_cours' => (int) $id,
                'progress' => $progress,
                'pourcentage' => $progress,
                'progression' => $progress,
                'isEnrolled' => true,
                'data' => [
                    'id_cours' => (int) $id,
                    'progress' => $progress,
                    'isEnrolled' => true,
                ],
            ], 200);
        }

        $inscriptionTable = (new InscriptionCours())->getTable();

        $payload = [
            'id_utilisateur' => $userId,
            'id_cours' => (int) $id,
        ];

        if (Schema::hasColumn($inscriptionTable, 'date_inscription')) {
            $payload['date_inscription'] = now();
        }

        if (Schema::hasColumn($inscriptionTable, 'statut')) {
            $payload['statut'] = 'en cours';
        }

        if (Schema::hasColumn($inscriptionTable, 'progress')) {
            $payload['progress'] = 0;
        }

        if (Schema::hasColumn($inscriptionTable, 'pourcentage')) {
            $payload['pourcentage'] = 0;
        }

        if (Schema::hasColumn($inscriptionTable, 'progression')) {
            $payload['progression'] = 0;
        }

        if (Schema::hasColumn($inscriptionTable, 'date_creation')) {
            $payload['date_creation'] = now();
        }

        if (Schema::hasColumn($inscriptionTable, 'date_modification')) {
            $payload['date_modification'] = now();
        }

        if (Schema::hasColumn($inscriptionTable, 'created_at')) {
            $payload['created_at'] = now();
        }

        if (Schema::hasColumn($inscriptionTable, 'updated_at')) {
            $payload['updated_at'] = now();
        }

        DB::table($inscriptionTable)->insert($payload);

        $inscription = InscriptionCours::where('id_utilisateur', $userId)
            ->where('id_cours', $id)
            ->first();

        return response()->json([
            'success' => true,
            'already_enrolled' => false,
            'message' => 'Inscription réussie',
            'id_cours' => (int) $id,
            'progress' => 0,
            'pourcentage' => 0,
            'progression' => 0,
            'isEnrolled' => true,
            'data' => [
                'id_cours' => (int) $id,
                'progress' => 0,
                'isEnrolled' => true,
                'inscription' => $inscription,
            ],
        ], 201);
    }
}