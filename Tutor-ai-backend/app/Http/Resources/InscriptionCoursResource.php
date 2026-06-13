<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InscriptionCoursResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_inscription' => $this->id_inscription,
            'date_inscription' => $this->date_inscription,
            'statut' => $this->statut ?? 'en_cours',
            'id_utilisateur' => $this->id_utilisateur,
            'id_cours' => $this->id_cours,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
            'cours' => new CoursResource($this->whenLoaded('cours')),
        ];
    }
}
