<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_utilisateur' => $this->id_utilisateur,
            'nom'            => $this->nom,
            'prenom'         => $this->prenom,
            'email'          => $this->email,
            'statut'         => $this->statut ?? 'actif',
            'date_creation'  => $this->date_creation,
            'id_role'        => $this->id_role,
            'id_niveau'      => $this->id_niveau ?? 0,
            'id_cycle'       => $this->id_cycle ?? ($this->niveau->id_cycle ?? 0),
            'id_filiere'     => $this->id_filiere,
            'avatar_url'     => $this->avatar_url ?? null,
            'role'           => new RoleResource($this->whenLoaded('role')),
            'niveau'         => new NiveauResource($this->whenLoaded('niveau')),
            'cycle'          => new CycleResource($this->whenLoaded('niveau.cycle')),
            'filiere'        => $this->whenLoaded('filiere'),
        ];
    }
}