<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatiereResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id_matiere,
            'name' => $this->nom_matiere,
            'description' => $this->description ?? null,
            'slug' => str($this->nom_matiere)->slug(),
            'created_at' => $this->date_creation,
        ];
    }
}
