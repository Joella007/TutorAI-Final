<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_progression' => $this->id_progression,
            'pourcentage' => $this->pourcentage,
            'date_mise_a_jour' => $this->date_mise_a_jour,
            'id_utilisateur' => $this->id_utilisateur,
            'id_cours' => $this->id_cours,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
            'cours' => new CoursResource($this->whenLoaded('cours')),
        ];
    }
}
