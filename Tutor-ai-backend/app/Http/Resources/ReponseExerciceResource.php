<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReponseExerciceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_reponse' => $this->id_reponse,
            'contenu_reponse' => $this->contenu_reponse,
            'est_correcte' => $this->est_correcte ?? false,
            'date_reponse' => $this->date_reponse,
            'id_utilisateur' => $this->id_utilisateur,
            'id_question' => $this->id_question,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
            'question' => new QuestionResource($this->whenLoaded('question')),
        ];
    }
}
