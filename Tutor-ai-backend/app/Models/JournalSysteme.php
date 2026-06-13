<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalSysteme extends Model
{
    use HasFactory;

    protected $table = 'journal_systeme';
    protected $primaryKey = 'id_journal';
    public $timestamps = false; // Disable if you don't have created_at and updated_at columns

    protected $fillable = [
        'action',
        'description',
        'date_action',
        'id_utilisateur',
        'date_modification',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur', 'id_utilisateur');
    }
}
