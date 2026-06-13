<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_evaluation' => $this->id_evaluation ?? 0,
            'titre' => $this->titre ?? '',
            'date_evaluation' => $this->date_evaluation ?? null,
            'note_maximale' => $this->note_maximale ?? 0,
            'id_cours' => $this->id_cours ?? 0,
            'cours' => new CoursResource($this->whenLoaded('cours')),
        ];
    }
}
