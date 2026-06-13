<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user()->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']);
        return new UserResource($user);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        // 1. On autorise id_niveau et id_filiere à être vérifiés
        $validator = Validator::make($request->all(), [
            'nom'        => 'sometimes|string|max:255',
            'prenom'     => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|max:255|unique:utilisateur,email,' . $user->id_utilisateur . ',id_utilisateur',
            'id_niveau'  => 'sometimes|integer|exists:niveau,id_niveau',
            'id_filiere' => 'nullable|integer|exists:filiere,id_filiere', // ✅ On autorise la mise à jour de la classe !
            'avatar'     => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:5120', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Gestion de l'upload avatar
        if ($request->hasFile('avatar')) {
            if ($user->avatar_url) {
                $oldPath = str_replace('/storage/', 'public/', $user->avatar_url);
                Storage::delete($oldPath);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = Storage::url($path);
        }

        // 3. Mise à jour des informations classiques
        $user->nom = $request->input('nom', $user->nom);
        $user->prenom = $request->input('prenom', $user->prenom);
        $user->email = $request->input('email', $user->email);

        // 4. ✅ MISE À JOUR DU PARCOURS SCOLAIRE DANS LA BDD
        // On vérifie avec "has" pour pouvoir accepter la valeur "null" (ex: si l'élève repasse au collège)
        if ($request->has('id_niveau')) {
            $user->id_niveau = $request->input('id_niveau');
        }
        
        if ($request->has('id_filiere')) {
            $user->id_filiere = $request->input('id_filiere');
        }

        // On sauvegarde explicitement dans la BDD
        $user->save();

        // On recharge les relations pour renvoyer le profil mis à jour à React
        $user->load(['role', 'niveau.cycle', 'filiere.niveau.cycle']);

        return new UserResource($user);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mot_de_passe_actuel'       => 'required|string',
            'mot_de_passe'              => 'required|string|min:8|confirmed',
            'mot_de_passe_confirmation' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->mot_de_passe_actuel, $user->mot_de_passe)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect.',
            ], 403);
        }

        $user->update(['mot_de_passe' => Hash::make($request->mot_de_passe)]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour avec succès.',
        ]);
    }
}