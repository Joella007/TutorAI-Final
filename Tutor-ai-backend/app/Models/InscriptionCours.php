<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InscriptionCours extends Model
{
    protected $table = 'inscription_cours';

    public $timestamps = false;

    protected $primaryKey = 'id_inscription';

    protected $fillable = [
        'date_inscription',
        'statut',
        'id_utilisateur',
        'id_cours',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function cours()
    {
        return $this->belongsTo(Cours::class, 'id_cours', 'id_cours');
    }
}
