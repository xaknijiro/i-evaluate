<?php

use App\Models\Evaluatee;
use App\Models\Indicator;
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
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Evaluatee::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignIdFor(Indicator::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->unsignedTinyInteger('value')->nullable()->default(null);
            $table->text('comments')->nullable()->default(null);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responses');
    }
};
