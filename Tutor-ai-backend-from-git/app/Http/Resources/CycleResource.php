<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id_cycle' => $this->id_cycle,
            'nom_cycle' => $this->nom_cycle,
            'date_creation' => $this->date_creation,
            'date_modification' => $this->date_modification,
        ];
    }
}
