<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'role';

    public $timestamps = false;

    protected $primaryKey = 'id_role';

    protected $fillable = [
        'nom_role',
        'description',
    ];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'id_role', 'id_role');
    }
}
