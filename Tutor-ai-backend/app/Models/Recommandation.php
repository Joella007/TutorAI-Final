<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recommandation extends Model
{
    protected $table = 'recommandation';

    public $timestamps = false;

    protected $primaryKey = 'id_recommandation';

    protected $fillable = [
        'contenu',
        'type_recommandation',
        'date_creation',
        'id_utilisateur',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
