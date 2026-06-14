<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cours;
use App\Models\JournalSysteme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    private string $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function generateQuiz(Request $request)
    {
        $request->validate([
            'id_cours'     => 'required|integer|exists:cours,id_cours',
            'nb_questions' => 'integer|min:3|max:10',
            'difficulte'   => 'string|in:Facile,Moyen,Difficile',
        ]);

        $user         = $request->user();
        $idCours      = $request->id_cours;
        $nbQuestions  = $request->nb_questions ?? 5;
        $difficulte   = $request->difficulte ?? 'Moyen';

        $cours = Cours::with(['chapitre.matiere', 'chapitre.lecons'])->findOrFail($idCours);
        $matiere  = $cours->chapitre?->matiere?->nom_matiere ?? 'Matière générale';
        $niveau   = $user?->niveau?->nom_niveau ?? $cours->niveau ?? 'Général';

        $contenuLecons = '';
        if ($cours->chapitre && $cours->chapitre->lecons->count() > 0) {
            foreach ($cours->chapitre->lecons->take(3) as $lecon) {
                $contenuLecons .= "- {$lecon->titre}\n";
            }
        }

        // 👈 NOUVEAU PROMPT : On interdit les guillemets doubles !
        $prompt = <<<PROMPT
Génère un quiz QCM pour évaluer la compréhension du cours suivant.
Cours : "{$cours->titre}"
Matière : {$matiere}
Niveau : {$niveau}
Difficulté : {$difficulte}

Règles ABSOLUES :
- Génère EXACTEMENT {$nbQuestions} questions.
- 4 options de réponse par question.
- L'explication de la réponse doit être concise (1 ou 2 phrases maximum).
- N'utilise JAMAIS de guillemets doubles (") à l'intérieur des textes, questions, options ou explications. Utilise uniquement des guillemets simples (').
PROMPT;

        $apiKey = config('services.gemini.api_key');

        try {
            $maxRetries = 3;
            $response = null;

            for ($i = 0; $i < $maxRetries; $i++) {
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout(60)
                    ->withQueryParameters(['key' => $apiKey])
                    ->post($this->geminiUrl, [
                        'contents' => [['parts' => [['text' => $prompt]]]],
                        'generationConfig' => [
                            'temperature'        => 0.2, // 👈 Encore plus bas pour éviter la "créativité" qui casse le JSON
                            'response_mime_type' => 'application/json',
                            'response_schema'    => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'question' => ['type' => 'string'],
                                        'options' => [
                                            'type' => 'array',
                                            'items' => ['type' => 'string']
                                        ],
                                        'correct' => ['type' => 'integer'],
                                        'explication' => ['type' => 'string']
                                    ],
                                    'required' => ['question', 'options', 'correct', 'explication']
                                ]
                            ]
                        ],
                    ]);

                if ($response->successful()) break;
                if ($response->status() === 503 || $response->status() === 429) { 
                    sleep(3); 
                    continue; 
                }
                break;
            }

            if (!$response || $response->failed()) {
                Log::error('Quiz API Error', ['status' => $response ? $response->status() : 'Unknown']);
                return response()->json(['message' => "Impossible de joindre l'IA pour générer le quiz."], 502);
            }

            $body = $response->json();
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            $text = preg_replace('/^```json\s*/im', '', $text);
            $text = preg_replace('/^```\s*/im', '', $text);
            
            if (preg_match('/\[[\s\S]+\]/u', $text, $matches)) {
                $text = $matches[0];
            }
            
            $quizArray = json_decode(trim($text), true);

            if (!$quizArray || !is_array($quizArray)) {
                // 👈 NOUVEAU LOG : Affiche le VRAI message d'erreur JSON et le texte COMPLET
                Log::error('Quiz Parsing Error', [
                    'json_error' => json_last_error_msg(),
                    'raw_text'   => $text
                ]);
                return response()->json(['message' => 'L\'IA a renvoyé un format invalide. Veuillez réessayer.'], 500);
            }

            $questionsValides = [];
            foreach ($quizArray as $q) {
                if (isset($q['question'], $q['options'], $q['correct']) && is_array($q['options'])) {
                    
                    $optionsNettoyees = [];
                    foreach ($q['options'] as $opt) {
                        if (is_array($opt)) {
                            $optionsNettoyees[] = (string) array_values($opt)[0];
                        } else {
                            $optionsNettoyees[] = (string) $opt;
                        }
                    }

                    $questionsValides[] = [
                        'question'    => (string) $q['question'],
                        'options'     => $optionsNettoyees,
                        'correct'     => (int) $q['correct'],
                        'explication' => isset($q['explication']) ? (string) $q['explication'] : 'Explication non fournie.',
                    ];
                }
            }

            if (count($questionsValides) === 0) {
                return response()->json(['message' => 'Aucune question valide n\'a pu être générée.'], 500);
            }

            return response()->json([
                'quiz'       => $questionsValides,
                'cours'      => $cours->titre,
                'niveau'     => $niveau,
                'difficulte' => $difficulte,
                'total'      => count($questionsValides),
            ]);

        } catch (\Exception $e) {
            Log::error('Quiz Internal Error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur serveur interne.'], 500);
        }
    }

    public function saveScore(Request $request)
    {
        $request->validate([
            'id_cours'    => 'required|integer|exists:cours,id_cours',
            'score'       => 'required|integer',
            'total'       => 'required|integer',
            'pourcentage' => 'required|integer',
        ]);

        $user = $request->user();
        $cours = Cours::find($request->id_cours);
        $titre = $cours ? $cours->titre : 'Cours inconnu';

        JournalSysteme::create([
            'action'             => 'Quiz d\'entraînement',
            'description'        => "A obtenu {$request->score}/{$request->total} ({$request->pourcentage}%) au quiz du cours : {$titre}",
            'date_action'        => now(),
            'date_modification'  => now(),
            'id_utilisateur'     => $user->id_utilisateur,
        ]);

        return response()->json(['success' => true, 'message' => 'Score enregistré avec succès.']);
    }
}