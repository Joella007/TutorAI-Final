<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Progression extends Model
{
    protected $table = 'progression';
    protected $primaryKey = 'id_progression';
    public $timestamps = false;

    protected $fillable = [
        'pourcentage',
        'date_mise_a_jour',
        'date_modification',
        'id_utilisateur',
        'id_cours'
    ];

    // 👇 CETTE FONCTION EST ESSENTIELLE POUR LA PAGE PROGRESSION
    public function cours()
    {
        return $this->belongsTo(Cours::class, 'id_cours', 'id_cours');
    }
}