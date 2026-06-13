<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cycle;
use App\Models\Niveau;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DB::table('utilisateur')->truncate();
        DB::table('niveau')->truncate();
        DB::table('cycle')->truncate();
        DB::table('utilisateur_role')->truncate();

        $cycles = [
            'Collège',
            'Lycée',
            'Université',
        ];

        $cycleIds = [];
        foreach ($cycles as $cycleNom) {
            $cycleIds[$cycleNom] = Cycle::create(['nom_cycle' => $cycleNom])->id_cycle;
        }

        $niveaux = [
            ['Collège',    '6ème',    1],
            ['Collège',    '5ème',    2],
            ['Collège',    '4ème',    3],
            ['Collège',    '3ème',    4],
            ['Lycée',      '2nde',    5],
            ['Lycée',      '1ère',    6],
            ['Lycée',      'Terminale', 7],
            ['Université', 'L1',     8],
            ['Université', 'L2',     9],
            ['Université', 'L3',     10],
        ];

        foreach ($niveaux as [$cycleNom, $nomNiveau, $ordre]) {
            Niveau::create([
                'nom_niveau'     => $nomNiveau,
                'id_cycle'       => $cycleIds[$cycleNom],
                'ordre_affichage'=> $ordre,
                'statut'         => 'Actif',
            ]);
        }

        User::factory()->create([
            'nom'           => 'Admin',
            'prenom'        => 'Test',
            'email'         => 'admin@test.com',
            'mot_de_passe'  => Hash::make('password'),
            'id_niveau'     => Niveau::where('nom_niveau', 'L1')->first()->id_niveau ?? null,
            'statut'        => 'actif',
            'date_creation' => now(),
        ]);
    }
}
