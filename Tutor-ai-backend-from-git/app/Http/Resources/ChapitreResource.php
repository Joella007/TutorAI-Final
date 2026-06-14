<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChapitreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_chapitre'   => $this->id_chapitre,
            'titre'         => $this->titre,
            'description'   => $this->description ?? null,
            'id_matiere'    => $this->id_matiere,
            'date_creation' => $this->date_creation,
            'matiere'       => new MatiereResource($this->whenLoaded('matiere')),
            'lecons'        => LeconResource::collection($this->whenLoaded('lecons')), // ← AJOUTÉ
        ];
    }
}