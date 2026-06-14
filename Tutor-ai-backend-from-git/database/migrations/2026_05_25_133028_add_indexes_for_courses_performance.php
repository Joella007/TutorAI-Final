<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            $table->index('niveau');
            $table->index('id_chapitre');
            $table->index('date_creation');
        });

        Schema::table('chapitre', function (Blueprint $table) {
            $table->index('id_matiere');
            $table->index('id_filiere');
        });

        Schema::table('inscription_cours', function (Blueprint $table) {
            $table->index('id_utilisateur');
            $table->index('id_cours');
        });
    }

    public function down(): void
    {
        Schema::table('cours', function (Blueprint $table) {
            $table->dropIndex(['niveau']);
            $table->dropIndex(['id_chapitre']);
            $table->dropIndex(['date_creation']);
        });

        Schema::table('chapitre', function (Blueprint $table) {
            $table->dropIndex(['id_matiere']);
            $table->dropIndex(['id_filiere']);
        });

        Schema::table('inscription_cours', function (Blueprint $table) {
            $table->dropIndex(['id_utilisateur']);
            $table->dropIndex(['id_cours']);
        });
    }
};