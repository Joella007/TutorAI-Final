<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractionIa extends Model
{
    protected $table = 'interaction_ia';

    public $timestamps = false;

    protected $primaryKey = 'id_interaction';

    protected $fillable = [
        'question_utilisateur',
        'reponse_ia',
        'date_interaction',
        'id_utilisateur',
        'session_id', 
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
