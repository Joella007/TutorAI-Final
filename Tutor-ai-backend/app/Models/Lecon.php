<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lecon extends Model
{
    protected $table = 'lecon';

    public $timestamps = false;

    protected $primaryKey = 'id_lecon';

    protected $fillable = [
        'titre',
        'contenu',
        'id_chapitre',
        'date_creation',
    ];

    public function chapitre()
    {
        return $this->belongsTo(Chapitre::class, 'id_chapitre', 'id_chapitre');
    }
}
