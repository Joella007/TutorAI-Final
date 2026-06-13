<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'question';

    public $timestamps = false;

    protected $primaryKey = 'id_question';

    protected $fillable = [
        'texte_question',
        'id_exercice',
        'date_creation',
    ];

    public function exercice()
    {
        return $this->belongsTo(Exercice::class, 'id_exercice', 'id_exercice');
    }

    public function reponses()
    {
        return $this->hasMany(ReponseExercice::class, 'id_question', 'id_question');
    }
}
