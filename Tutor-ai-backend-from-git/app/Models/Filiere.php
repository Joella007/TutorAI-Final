<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    protected $table      = 'filiere';
    public    $timestamps = false;
    protected $primaryKey = 'id_filiere';

    protected $fillable = [
        'nom_filiere',
        'description',
        'id_niveau',
        'ordre_affichage',
        'date_creation',
        'date_modification',
    ];

    // ── Relations ─────────────────────────────────────────────────────────────

    public function niveau()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau', 'id_niveau');
    }

    public function cycle()
    {
        return $this->niveau->cycle ?? null;
    }

    public function chapitres()
    {
        return $this->hasMany(Chapitre::class, 'id_filiere', 'id_filiere');
    }
}
