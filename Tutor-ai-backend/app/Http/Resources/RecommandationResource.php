<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommandationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_recommandation' => $this->id_recommandation,
            'contenu' => $this->contenu,
            'type_recommandation' => $this->type_recommandation ?? null,
            'date_creation' => $this->date_creation,
            'id_utilisateur' => $this->id_utilisateur,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
        ];
    }
}
