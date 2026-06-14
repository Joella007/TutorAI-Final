<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeconResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_lecon' => $this->id_lecon,
            'titre' => $this->titre,
            'contenu' => $this->contenu ?? null,
            'id_chapitre' => $this->id_chapitre,
            'date_creation' => $this->date_creation,
            'type' => $this->type ?? 'text',
            'duration' => $this->duration ?? 0,
            'completed' => $this->completed ?? false,
            'chapitre' => new ChapitreResource($this->whenLoaded('chapitre')),
        ];
    }
}
