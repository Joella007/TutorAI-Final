<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NiveauResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_niveau' => $this->id_niveau,
            'nom_niveau' => $this->nom_niveau,
            'description' => $this->description,
            'id_cycle' => $this->id_cycle,
            'cycle' => new CycleResource($this->whenLoaded('cycle')),
        ];
    }
}