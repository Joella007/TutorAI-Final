<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InteractionIa;
use App\Models\Cours;
use App\Models\Niveau;
use App\Models\Exercice;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AIChatController extends Controller
{
    private string $geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function chat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message'      => 'required|string|max:5000',
            'id_cours'     => 'nullable|integer|exists:cours,id_cours',
            'id_exercice'  => 'nullable|integer|exists:exercice,id_exercice',
            'id_matiere'   => 'nullable|integer|exists:matiere,id_matiere',
            'session_id'   => 'nullable|string', // 👈 On accepte le Session ID
            'with_history' => 'nullable|boolean',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $user        = $request->user();
        $message     = $request->input('message');
        $idCours     = $request->input('id_cours');
        $idExercice  = $request->input('id_exercice');
        $idMatiere   = $request->input('id_matiere');
        $sessionId   = $request->input('session_id') ?? uniqid('chat_'); // 👈 Génère un ID s'il n'y en a pas
        $withHistory = $request->boolean('with_history', true);

        // ── Contexte ──
        $coursContext = '';
        $matiereNom   = 'générale';
        $exercice     = null;

        if ($idCours) {
            $cours = Cours::with('chapitre.matiere')->find($idCours);
            if ($cours) {
                $matiereNom = $cours->chapitre?->matiere?->nom_matiere ?? 'matière inconnue';
                $coursContext = "L'étudiant étudie le cours : \"{$cours->titre}\" (Matière : {$matiereNom}). Description : {$cours->description}.";
            }
        } elseif ($idMatiere) {
            $matiereObj = Matiere::find($idMatiere);
            if ($matiereObj) {
                $matiereNom = $matiereObj->nom_matiere;
                $coursContext = "L'étudiant pose une question de révision libre sur la matière : {$matiereNom}.";
            }
        }

        if ($idExercice) {
            $exercice = Exercice::find($idExercice);
            if ($exercice) {
                $coursContext .= "\n\nL'étudiant vient de soumettre une réponse pour cet exercice :\nÉnoncé : {$exercice->enonce}\nType : {$exercice->type_exercice}\n";
            }
        }

        $niveauContext = '';
        if ($user->id_niveau) {
            $niveau = Niveau::find($user->id_niveau);
            if ($niveau) $niveauContext = "L'étudiant est au niveau : {$niveau->nom_niveau}. Adapte ton explication à ce niveau d'étude.";
        }

        $systemPrompt = $this->buildSystemPrompt($user->nom ?? 'Étudiant', $coursContext, $niveauContext, $exercice, $matiereNom);

        $apiKey = config('services.gemini.api_key');
        if (!$apiKey) return response()->json(['message' => 'Clé API Gemini manquante.'], 500);
        
        $contents = [];
        
        // 👈 NOUVEAU : On ne charge QUE l'historique de cette discussion précise (Ordre chronologique) !
        if ($withHistory && !$exercice) {
            $recent = InteractionIa::where('id_utilisateur', $user->id_utilisateur)
                ->where('session_id', $sessionId)
                ->orderBy('date_interaction', 'asc') // Chronologique pour que Gemini comprenne le fil
                ->get();

            foreach ($recent as $interaction) {
                $contents[] = ['role' => 'user', 'parts' => [['text' => $interaction->question_utilisateur]]];
                $contents[] = ['role' => 'model', 'parts' => [['text' => $interaction->reponse_ia]]];
            }
        }
        
        $contents[] = [
            'role' => 'user', 
            'parts' => [['text' => "INSTRUCTIONS SYSTEME (Secret) : " . $systemPrompt . "\n\n--- MESSAGE ÉLÈVE : " . $message]]
        ];

        try {
            $response = null;
            for ($i = 0; $i < 3; $i++) {
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                  ->timeout(45)->withQueryParameters(['key' => $apiKey])
                  ->post($this->geminiUrl, [
                    'contents' => $contents,
                    'generationConfig' => ['temperature' => 0.4, 'maxOutputTokens' => 1024]
                ]);
                if ($response->successful()) break;
                if ($response->status() === 503) { sleep(2); continue; }
                break;
            }
            
            if (!$response || $response->failed()) {
                return response()->json(['message' => 'L\'IA est très sollicitée en ce moment. Réessayez dans un instant.'], 502);
            }

            $aiResponse = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if (!$aiResponse) return response()->json(['message' => 'L\'IA a renvoyé une réponse vide.'], 500);
            
            // Sauvegarder la nouvelle question dans la discussion actuelle
            if (!$idExercice) {
                InteractionIa::create([
                    'question_utilisateur' => $message,
                    'reponse_ia'           => $aiResponse,
                    'session_id'           => $sessionId, // 👈 On sauvegarde l'ID de la conversation !
                    'date_interaction'     => now(),
                    'date_modification'    => now(),
                    'id_utilisateur'       => $user->id_utilisateur,
                    'id_cours'             => $idCours,
                ]);
            }

            return response()->json(['success' => true, 'data' => ['ai_response' => $aiResponse, 'session_id' => $sessionId]]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur interne lors de la génération.'], 500);
        }
    }

    private function buildSystemPrompt(string $nomEleve, string $coursContext, string $niveauContext, ?Exercice $exercice, string $matiereNom): string
    {
        $prompt = "Tu es TutorAI, un tuteur pédagogique.\n\nCONTEXTE : {$coursContext}\n{$niveauContext}\n\n";
        if ($exercice) {
            $prompt .= "RÈGLE 1 : L'étudiant te donne sa réponse à l'exercice ci-dessus.\n";
            $prompt .= "RÈGLE 2 : Si c'est un QCM, dis UNIQUEMENT si c'est ✅ CORRECT ou ❌ INCORRECT dès la première phrase, puis donne une justification brève.\n";
            $prompt .= "RÈGLE 3 : Ne pose AUCUNE question à la fin de ton message. Donne juste le feedback direct.\n";
        } else {
            $prompt .= "RÈGLE ABSOLUE N°1 : Tu es spécialisé UNIQUEMENT dans la matière suivante : {$matiereNom}. Si l'élève te pose une question hors-sujet, tu DOIS REFUSER poliment.\n";
            $prompt .= "RÈGLE 2 : Ne donne pas la réponse directe à ses devoirs. Utilise la maïeutique (guide-le par des indices).\n";
        }
        return $prompt;
    }

    // ── L'historique groupe les messages par Session ID ! ──
    public function history(Request $request)
    {
        $interactions = InteractionIa::where('id_utilisateur', $request->user()->id_utilisateur)
            ->orderBy('date_interaction', 'asc') // On prend tout en ordre chronologique
            ->get();
        
        // Grouper par session_id (ou par id_interaction pour les très anciens messages)
        $grouped = $interactions->groupBy(function($item) {
            return $item->session_id ?? 'old_' . $item->id_interaction;
        });

        $history = [];
        foreach ($grouped as $sessId => $group) {
            $first = $group->first(); // Le premier message sert de Titre à la discussion
            $last = $group->last();   // Le dernier message donne la date pour le tri

            $history[] = [
                'id_interaction'       => $sessId, // On utilise le session_id comme ID principal pour l'interface
                'session_id'           => $sessId,
                'question_utilisateur' => $first->question_utilisateur, 
                'date_interaction'     => $last->date_interaction,
                'messages'             => $group->map(function ($i) {
                    return [
                        'id' => $i->id_interaction,
                        'question' => $i->question_utilisateur,
                        'reponse' => $i->reponse_ia
                    ];
                })->values()
            ];
        }

        // On trie de la discussion la plus récente à la plus ancienne
        usort($history, function($a, $b) {
            return strtotime($b['date_interaction']) <=> strtotime($a['date_interaction']);
        });

        return response()->json(['success' => true, 'data' => $history]);
    }

    public function deleteHistory(Request $request, $id)
    {
        // On supprime tous les messages de cette session d'un coup !
        $query = InteractionIa::where('id_utilisateur', $request->user()->id_utilisateur);
        
        if (str_starts_with($id, 'old_')) {
            $query->where('id_interaction', str_replace('old_', '', $id))->delete();
        } else {
            $query->where('session_id', $id)->delete();
        }

        return response()->json(['success' => true, 'message' => 'Discussion supprimée.']);
    }
}