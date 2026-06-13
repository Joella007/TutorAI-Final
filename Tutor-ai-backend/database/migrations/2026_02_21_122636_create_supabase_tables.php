<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates all tables based on Supabase schema
     */
    public function up(): void
    {
        // Table: role
        Schema::create('role', function (Blueprint $table) {
            $table->id('id_role');
            $table->string('nom_role');
            $table->text('description')->nullable();
        });

        // Table: niveau
        Schema::create('niveau', function (Blueprint $table) {
            $table->id('id_niveau');
            $table->string('nom_niveau');
            $table->text('description')->nullable();
        });

        // Table: utilisateur
        Schema::create('utilisateur', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('mot_de_passe');
            $table->string('statut')->default('actif');
            $table->dateTime('date_creation')->default(now());
            $table->foreignId('id_role')->constrained('role', 'id_role');
            $table->foreignId('id_niveau')->nullable()->constrained('niveau', 'id_niveau');
        });

        // Table: matiere
        Schema::create('matiere', function (Blueprint $table) {
            $table->id('id_matiere');
            $table->string('nom_matiere');
            $table->text('description')->nullable();
            $table->dateTime('date_creation')->default(now());
        });

        // Table: chapitre
        Schema::create('chapitre', function (Blueprint $table) {
            $table->id('id_chapitre');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->foreignId('id_matiere')->constrained('matiere', 'id_matiere');
            $table->dateTime('date_creation')->default(now());
        });

        // Table: cours
        Schema::create('cours', function (Blueprint $table) {
            $table->id('id_cours');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('niveau')->nullable();
            $table->foreignId('id_chapitre')->constrained('chapitre', 'id_chapitre');
            $table->dateTime('date_creation')->default(now());
            $table->string('thumbnail')->nullable();
            $table->integer('duration')->default(0);
            $table->integer('lessonsCount')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('enrolledCount')->default(0);
        });

        // Table: lecon
        Schema::create('lecon', function (Blueprint $table) {
            $table->id('id_lecon');
            $table->string('titre');
            $table->text('contenu')->nullable();
            $table->foreignId('id_chapitre')->constrained('chapitre', 'id_chapitre');
            $table->dateTime('date_creation')->default(now());
            $table->string('type')->default('text');
            $table->integer('duration')->default(0);
        });

        // Table: inscription_cours
        Schema::create('inscription_cours', function (Blueprint $table) {
            $table->id('id_inscription');
            $table->dateTime('date_inscription')->default(now());
            $table->string('statut')->default('en_cours');
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur');
            $table->foreignId('id_cours')->constrained('cours', 'id_cours');
        });

        // Table: progression
        Schema::create('progression', function (Blueprint $table) {
            $table->id('id_progression');
            $table->decimal('pourcentage', 5, 2)->default(0);
            $table->dateTime('date_mise_a_jour')->default(now());
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur');
            $table->foreignId('id_cours')->constrained('cours', 'id_cours');
            $table->unique(['id_utilisateur', 'id_cours']);
        });

        // Table: interaction_ia
        Schema::create('interaction_ia', function (Blueprint $table) {
            $table->id('id_interaction');
            $table->text('question_utilisateur');
            $table->text('reponse_ia');
            $table->dateTime('date_interaction')->default(now());
            $table->foreignId('id_utilisateur')->constrained('utilisateur', 'id_utilisateur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interaction_ia');
        Schema::dropIfExists('progression');
        Schema::dropIfExists('inscription_cours');
        Schema::dropIfExists('lecon');
        Schema::dropIfExists('cours');
        Schema::dropIfExists('chapitre');
        Schema::dropIfExists('matiere');
        Schema::dropIfExists('utilisateur');
        Schema::dropIfExists('niveau');
        Schema::dropIfExists('role');
    }
};
