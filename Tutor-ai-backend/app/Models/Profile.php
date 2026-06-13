<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profiles';

    public $timestamps = false;

    protected $primaryKey = 'id';

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'nom',
        'prenom',
        'email',
        'avatar_url',
        'id_niveau',
        'created_at',
        'updated_at',
    ];

    public function niveau()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau', 'id_niveau');
    }
}
