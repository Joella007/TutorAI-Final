<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapitre extends Model
{
    protected $table      = 'chapitre';
    public    $timestamps = false;
    protected $primaryKey = 'id_chapitre';

    protected $fillable = [
        'titre',
        'description',
        'id_matiere',
        'id_filiere',   // ← NOUVEAU
        'date_creation',
        'date_modification',
    ];

    // ── Relations ─────────────────────────────────────────────────────────────

    public function matiere()
    {
        return $this->belongsTo(Matiere::class, 'id_matiere', 'id_matiere');
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'id_filiere', 'id_filiere'); // ← NOUVEAU
    }

    public function cours()
    {
        return $this->hasMany(Cours::class, 'id_chapitre', 'id_chapitre');
    }

    public function lecons()
    {
        return $this->hasMany(Lecon::class, 'id_chapitre', 'id_chapitre');
    }
}
