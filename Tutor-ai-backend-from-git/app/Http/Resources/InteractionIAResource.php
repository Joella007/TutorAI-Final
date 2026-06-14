<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InteractionIAResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_interaction' => $this->id_interaction,
            'question_utilisateur' => $this->question_utilisateur,
            'reponse_ia' => $this->reponse_ia,
            'date_interaction' => $this->date_interaction,
            'id_utilisateur' => $this->id_utilisateur,
            'utilisateur' => new UserResource($this->whenLoaded('utilisateur')),
        ];
    }
}
