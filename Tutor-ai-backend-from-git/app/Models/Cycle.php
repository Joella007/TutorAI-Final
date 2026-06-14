<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cycle extends Model
{
    protected $table = 'cycle';

    public $timestamps = true;

    protected $primaryKey = 'id_cycle';

    protected $fillable = [
        'nom_cycle',
    ];

    public function niveaux()
    {
        return $this->hasMany(Niveau::class, 'id_cycle', 'id_cycle');
    }

    public function filieres()
    {
        return $this->hasManyThrough(Filiere::class, Niveau::class, 'id_cycle', 'id_niveau', 'id_cycle', 'id_niveau');
    }
}
