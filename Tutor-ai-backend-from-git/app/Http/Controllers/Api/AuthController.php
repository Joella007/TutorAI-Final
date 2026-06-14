<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * POST /api/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'nom'          => 'required|string|max:255',
                'prenom'       => 'required|string|max:255',
                'email'        => 'required|string|email|max:255|unique:utilisateur,email',
                'mot_de_passe' => [
                    'required', 'string', 'min:8', 'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#])[A-Za-z\d@$!%*?&_\-#]{8,}$/'
                ],
                'id_niveau'    => 'nullable|integer|exists:niveau,id_niveau',
                'id_filiere'   => 'nullable|integer|exists:filiere,id_filiere', // ✅ AJOUT DE LA FILIÈRE
            ],
            [
                'nom.required'           => 'Le nom est obligatoire.',
                'prenom.required'        => 'Le prénom est obligatoire.',
                'email.required'         => 'L\'adresse email est obligatoire.',
                'email.email'            => 'L\'adresse email n\'est pas valide.',
                'email.unique'           => 'Cette adresse email est déjà utilisée.',
                'mot_de_passe.required'  => 'Le mot de passe est obligatoire.',
                'mot_de_passe.min'       => 'Le mot de passe doit contenir au minimum 8 caractères.',
                'mot_de_passe.confirmed' => 'Les mots de passe ne correspondent pas.',
                'mot_de_passe.regex'     => 'Le mot de passe doit contenir au moins : 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&_-#).',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Récupérer le rôle Apprenant
        $roleApprenant = Role::where('nom_role', 'Apprenant')->first();
        if (!$roleApprenant) {
            return response()->json(['message' => 'Le rôle "Apprenant" est introuvable. Veuillez initialiser les rôles.'], 500);
        }

        // Créer l'utilisateur SANS id_role (la table utilisateur n'a pas cette colonne)
        $user = User::create([
            'nom'           => $request->nom,
            'prenom'        => $request->prenom,
            'email'         => $request->email,
            'mot_de_passe'  => Hash::make($request->mot_de_passe),
            'id_niveau'     => $request->id_niveau,
            'id_filiere'    => $request->id_filiere, // ✅ ENREGISTREMENT DE LA FILIÈRE
            'statut'        => 'actif',
            'date_creation' => now(),
        ]);

        // Insérer le rôle dans la table pivot utilisateur_role
        DB::table('utilisateur_role')->insert([
            'id_utilisateur' => $user->id_utilisateur,
            'id_role'        => $roleApprenant->id_role,
        ]);

        $user->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']);

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email'        => 'required|email',
                'mot_de_passe' => 'required|string',
            ],
            [
                'email.required'        => 'L\'adresse email est obligatoire.',
                'email.email'           => 'L\'adresse email n\'est pas valide.',
                'mot_de_passe.required' => 'Le mot de passe est obligatoire.',
            ]
        );

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->mot_de_passe, $user->mot_de_passe)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        if ($user->statut !== 'actif') {
            return response()->json(['message' => 'Ce compte est désactivé.'], 403);
        }

        $user->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']);

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }
}