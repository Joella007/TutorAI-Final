<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoursResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id_cours' => $this->id_cours,
            'titre' => $this->titre,
            'description' => $this->description,
            'niveau' => $this->niveau,
            'duree' => $this->duree,
            'date_creation' => $this->date_creation,

            'chapitre' => $this->whenLoaded('chapitre', function () {
                $chapitre = $this->chapitre;

                if (!$chapitre) {
                    return null;
                }

                return [
                    'id_chapitre' => $chapitre->id_chapitre,
                    'titre' => $chapitre->titre,
                    'id_matiere' => $chapitre->id_matiere,
                    'id_filiere' => $chapitre->id_filiere,

                    'matiere' => $chapitre->relationLoaded('matiere') && $chapitre->matiere
                        ? [
                            'id' => $chapitre->matiere->id_matiere,
                            'name' => $chapitre->matiere->nom_matiere,
                        ]
                        : null,

                    'filiere' => $chapitre->relationLoaded('filiere') && $chapitre->filiere
                        ? [
                            'id_filiere' => $chapitre->filiere->id_filiere,
                            'nom_filiere' => $chapitre->filiere->nom_filiere,
                            'id_niveau' => $chapitre->filiere->id_niveau,
                        ]
                        : null,

                    'lecons' => $chapitre->relationLoaded('lecons')
                        ? $chapitre->lecons->map(function ($lecon) {
                            return [
                                'id_lecon' => $lecon->id_lecon,
                                'titre' => $lecon->titre,
                                'contenu' => $lecon->contenu,
                            ];
                        })->values()
                        : [],
                ];
            }),

            // Important :
            // Les exercices ne sont retournés que si la relation a été chargée.
            // Donc dans /cours, ils ne seront pas chargés.
            // Dans /cours/{id}, ils seront bien présents.
            'exercices' => $this->whenLoaded('exercices', function () {
                return $this->exercices->map(function ($exercice) {
                    return [
                        'id_exercice' => $exercice->id_exercice,
                        'enonce' => $exercice->enonce,
                        'type_exercice' => $exercice->type_exercice,
                        'difficulte' => $exercice->difficulte,
                        'points' => $exercice->points,
                    ];
                })->values();
            }),
        ];
    }
}