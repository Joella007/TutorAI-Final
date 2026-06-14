<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_question' => $this->id_question,
            'texte_question' => $this->texte_question,
            'id_exercice' => $this->id_exercice,
            'date_creation' => $this->date_creation,
            'options' => $this->options ?? [],
            'correctAnswer' => $this->correctAnswer ?? null,
            'exercice' => new ExerciceResource($this->whenLoaded('exercice')),
        ];
    }
}
