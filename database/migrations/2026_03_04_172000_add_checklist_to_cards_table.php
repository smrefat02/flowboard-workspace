<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table): void {
            $table->json('checklist')->nullable()->after('due_date');
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table): void {
            $table->dropColumn('checklist');
        });
    }
};
