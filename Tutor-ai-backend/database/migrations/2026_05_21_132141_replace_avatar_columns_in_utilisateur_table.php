<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('utilisateur', function (Blueprint $table) {
            $table->dropColumn(['avatar_seed', 'avatar_style']);
            $table->string('avatar_url')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateur', function (Blueprint $table) {
            $table->dropColumn('avatar_url');
            $table->string('avatar_seed')->nullable();
            $table->string('avatar_style')->nullable();
        });
    }
};