<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cours extends Model
{
    protected $table = 'cours';

    public $timestamps = false;

    protected $primaryKey = 'id_cours';

    protected $fillable = [
        'titre',
        'description',
        'niveau',
        'id_chapitre',
        'date_creation',
    ];

    public function chapitre()
    {
        return $this->belongsTo(Chapitre::class, 'id_chapitre', 'id_chapitre');
    }

    public function exercices()
    {
        return $this->hasMany(Exercice::class, 'id_cours', 'id_cours');
    }

    public function inscriptions()
    {
        return $this->hasMany(InscriptionCours::class, 'id_cours', 'id_cours');
    }

    public function progressions()
    {
        return $this->hasMany(Progression::class, 'id_cours', 'id_cours');
    }
}
