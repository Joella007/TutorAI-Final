<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exercice extends Model
{
    protected $table = 'exercice';

    public $timestamps = false;

    protected $primaryKey = 'id_exercice';

    protected $fillable = [
        'enonce',
        'type_exercice',
        'date_creation',
        'id_cours',
    ];

    public function cours()
    {
        return $this->belongsTo(Cours::class, 'id_cours', 'id_cours');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'id_exercice', 'id_exercice');
    }
}
