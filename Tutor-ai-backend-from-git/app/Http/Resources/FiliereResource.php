<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FiliereResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_filiere' => $this->id_filiere,
            'nom_filiere' => $this->nom_filiere,
            'description' => $this->description,
            'id_niveau' => $this->id_niveau,
            'ordre_affichage' => $this->ordre_affichage,
        ];
    }
}
