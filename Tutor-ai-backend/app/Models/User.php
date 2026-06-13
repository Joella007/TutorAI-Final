<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;

/**
 * Modèle User unifié — pointe sur la table `utilisateur` de Supabase.
 * C'est CE modèle qui est utilisé partout (Auth, Sanctum, controllers).
 * Le modèle Utilisateur.php peut être supprimé ou gardé comme alias.
 */
class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'utilisateur';
    protected $primaryKey = 'id_utilisateur';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'statut',
        'date_creation',
        'id_role',
        'id_niveau',
        'id_filiere', //nouveau
        'avatar_url', // ✅ ajouté
        
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    /**
     * Laravel utilise 'password' par défaut — on redirige vers 'mot_de_passe'.
     */
    // public function getAuthPassword(): string
    // {
    //     return $this->mot_de_passe;
    // }
    // new
    public function getAuthPasswordName(): string
    {
        return 'mot_de_passe';
    }
    public function getEmailForPasswordReset(): string
    {
        return $this->email;
    }
    public function sendPasswordResetNotification($token): void
    {
        ResetPasswordNotification::createUrlUsing(function ($notifiable, $token) {
            return 'http://localhost:8080/reset-password'
                . '?token=' . $token
                . '&email=' . urlencode($notifiable->email);
        });

        $this->notify(new ResetPasswordNotification($token));
    }
    
    // ─── Relations ────────────────────────────────────────────────────────────

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class, 'id_niveau', 'id_niveau');
    }

    public function cycle()
    {
        return $this->niveau->cycle ?? null;
    }

    public function inscriptions()
    {
        return $this->hasMany(InscriptionCours::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function progressions()
    {
        return $this->hasMany(Progression::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function interactions()
    {
        return $this->hasMany(InteractionIa::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function reponses()
    {
        return $this->hasMany(ReponseExercice::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function recommandations()
    {
        return $this->hasMany(Recommandation::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function resultats()
    {
        return $this->hasMany(ResultatEvaluation::class, 'id_utilisateur', 'id_utilisateur');
    }

    public function journaux()
    {
        return $this->hasMany(JournalSysteme::class, 'id_utilisateur', 'id_utilisateur');
    }
        public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'id_filiere', 'id_filiere');
    }
}
