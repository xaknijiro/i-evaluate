<?php

use App\Models\Evaluatee;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Evaluatee::class)
                ->unique()
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->json('details')->nullable()->default(null);
            $table->json('remarks')->nullable()->default(null);
            $table->boolean('is_released')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
