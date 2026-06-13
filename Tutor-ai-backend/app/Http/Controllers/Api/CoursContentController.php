<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CoursResource;
use App\Models\Cours;
use App\Models\Lecon;
use App\Models\Exercice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CoursContentController extends Controller
{
    private string $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    /**
     * POST /api/cours/{id}/generate-content
     *
     * Génère les leçons et exercices d'un cours via Gemini IA.
     * Le contenu est enregistré en base de données.
     *
     * Si le contenu existe déjà et que force=false, on retourne simplement
     * le cours existant sans régénérer.
     */
    public function generateContent(Request $request, int $id)
    {
        $force = $request->boolean('force', false);

        $cours = Cours::with([
            'chapitre.matiere',
            'chapitre.filiere',
            'chapitre.lecons',
            'exercices',
        ])->findOrFail($id);

        if (!$cours->chapitre) {
            return response()->json([
                'message' => 'Impossible de générer le contenu : ce cours n’a pas de chapitre.',
            ], 422);
        }

        $hasExistingLessons = $cours->chapitre->lecons->count() > 0;

        if ($hasExistingLessons && !$force) {
            return new CoursResource($cours);
        }

        $matiere  = $cours->chapitre?->matiere?->nom_matiere ?? 'cette matière';
        $chapitre = $cours->chapitre?->titre ?? 'ce chapitre';
        $filiere  = $cours->chapitre?->filiere?->nom_filiere ?? '';
        $niveau   = $cours->niveau ?? 'général';
        $duree    = $cours->duree ?? '2h';

        $contexteFiliere = $filiere
            ? "Classe/Filière : {$filiere}\n"
            : '';

        $prompt = <<<PROMPT
Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant, sans texte après, sans markdown, sans backticks.

Génère le contenu pédagogique pour ce cours selon le programme scolaire malgache :

- Titre : {$cours->titre}
- Description : {$cours->description}
- Matière : {$matiere}
- Chapitre : {$chapitre}
- Niveau : {$niveau}
{$contexteFiliere}- Durée : {$duree}

Format JSON attendu, commence directement par { :

{
  "lecons": [
    {
      "titre": "string",
      "contenu": "string minimum 200 mots"
    }
  ],
  "exercices": [
    {
      "enonce": "string",
      "type_exercice": "QCM|Rédaction|Code|Calcul",
      "difficulte": "Facile|Moyen|Difficile",
      "points": 10
    }
  ]
}

Génère 3 à 5 leçons et 3 à 5 exercices. Contenu en français, adapté au programme malgache.
Commence ta réponse directement par le caractère {
PROMPT;

        try {
            $response = Http::withHeaders([
                'Content-Type'   => 'application/json',
                'x-goog-api-key' => config('services.gemini.api_key'),
            ])
                ->timeout(60)
                ->post($this->geminiUrl, [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature'        => 0.3,
                        'maxOutputTokens'    => 8192,
                        'response_mime_type' => 'application/json',
                    ],
                ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                return response()->json([
                    'message' => 'Erreur API Gemini: ' . $response->status(),
                ], 500);
            }

            $body = $response->json();

            $finishReason = $body['candidates'][0]['finishReason'] ?? 'STOP';

            if ($finishReason === 'MAX_TOKENS') {
                Log::warning('Gemini response truncated - MAX_TOKENS reached');
            }

            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $text = preg_replace('/^```json\s*/im', '', $text);
            $text = preg_replace('/^```\s*/im', '', $text);
            $text = preg_replace('/```\s*$/im', '', $text);

            if (preg_match('/\{[\s\S]*\}/u', $text, $matches)) {
                $text = $matches[0];
            }

            $text = trim($text);
            $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');

            Log::info('Gemini raw text', [
                'text' => substr($text, 0, 500),
            ]);

            $generated = json_decode($text, true, 512, JSON_INVALID_UTF8_SUBSTITUTE);

            if (!$generated) {
                $textClean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);
                $generated = json_decode($textClean, true, 512, JSON_INVALID_UTF8_SUBSTITUTE);
            }

            if (!$generated && preg_match('/\{[\s\S]+\}/u', $text, $m)) {
                $generated = json_decode($m[0], true, 512, JSON_INVALID_UTF8_SUBSTITUTE);
            }

            if (!$generated || (!isset($generated['lecons']) && !isset($generated['lessons']))) {
                Log::error('Invalid Gemini response', [
                    'text'       => substr($text, 0, 1000),
                    'json_error' => json_last_error_msg(),
                ]);

                return response()->json([
                    'message' => 'Réponse IA invalide : ' . json_last_error_msg(),
                    'raw'     => substr($text, 0, 500),
                ], 500);
            }

            if (!isset($generated['lecons']) && isset($generated['lessons'])) {
                $generated['lecons'] = $generated['lessons'];
            }

            DB::transaction(function () use ($cours, $generated, $force) {
                if ($force) {
                    Lecon::where('id_chapitre', $cours->chapitre->id_chapitre)->delete();
                }

                // Si on génère pour la première fois, il n’y a normalement pas de leçons.
                // On supprime les exercices existants pour éviter les doublons.
                Exercice::where('id_cours', $cours->id_cours)->delete();

                if (isset($generated['lecons']) && is_array($generated['lecons'])) {
                    foreach ($generated['lecons'] as $leconData) {
                        Lecon::create([
                            'titre'       => $leconData['titre'] ?? 'Leçon',
                            'contenu'     => $leconData['contenu'] ?? '',
                            'id_chapitre' => $cours->chapitre->id_chapitre,
                        ]);
                    }
                }

                if (isset($generated['exercices']) && is_array($generated['exercices'])) {
                    foreach ($generated['exercices'] as $exData) {
                        Exercice::create([
                            'enonce'        => $exData['enonce'] ?? 'Exercice',
                            'type_exercice' => $exData['type_exercice'] ?? 'QCM',
                            'difficulte'    => $exData['difficulte'] ?? 'Moyen',
                            'points'        => $exData['points'] ?? 10,
                            'id_cours'      => $cours->id_cours,
                        ]);
                    }
                }
            });

            $cours->load([
                'chapitre.matiere',
                'chapitre.filiere',
                'chapitre.lecons',
                'exercices',
            ]);

            return new CoursResource($cours);
        } catch (\Exception $e) {
            Log::error('Content generation error', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Erreur lors de la génération : ' . $e->getMessage(),
            ], 500);
        }
    }
}