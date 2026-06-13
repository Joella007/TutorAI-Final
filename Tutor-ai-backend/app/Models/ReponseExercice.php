<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReponseExercice extends Model
{
    protected $table = 'reponse_exercice';

    public $timestamps = false;

    protected $primaryKey = 'id_reponse';

    protected $fillable = [
        'contenu_reponse',
        'est_correcte',
        'date_reponse',
        'id_utilisateur',
        'id_question',
    ];

    protected $casts = [
        'est_correcte' => 'boolean',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'id_question', 'id_question');
    }
}
