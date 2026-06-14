<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultatEvaluation extends Model
{
    use HasFactory;

    protected $table = 'resultat_evaluation';
    protected $primaryKey = 'id_resultat';
    public $timestamps = false; // Disable if you don't have created_at and updated_at columns

    protected $fillable = [
        'note_obtenue',
        'commentaire',
        'date_resultat',
        'id_utilisateur',
        'id_evaluation',
        'date_modification',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class, 'id_evaluation', 'id_evaluation');
    }
}
