<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matiere extends Model
{
    protected $table = 'matiere';

    public $timestamps = false;

    protected $primaryKey = 'id_matiere';

    protected $fillable = [
        'nom_matiere',
        'description',
        'date_creation',
    ];

    public function chapitres()
    {
        return $this->hasMany(Chapitre::class, 'id_matiere', 'id_matiere');
    }
}
