<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultatEvaluationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_resultat' => $this->id_resultat ?? 0,
            'note_obtenue' => $this->note_obtenue ?? 0,
            'commentaire' => $this->commentaire ?? null,
            'date_resultat' => $this->date_resultat ?? null,
            'id_utilisateur' => $this->id_utilisateur ?? 0,
            'id_evaluation' => $this->id_evaluation ?? 0,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
            'evaluation' => new EvaluationResource($this->whenLoaded('evaluation')),
        ];
    }
}
