<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExerciceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_exercice' => $this->id_exercice,
            'enonce' => $this->enonce,
            'type_exercice' => $this->type_exercice ?? 'multiple_choice',
            'date_creation' => $this->date_creation,
            'id_cours' => $this->id_cours,
            'cours' => new CoursResource($this->whenLoaded('cours')),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),
        ];
    }
}
