<?php

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
        Schema::create('evaluation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_schedule_subject_class_id')
                ->unique()
                ->references('id', 'evaluation_results_evaluation_schedule_subject_class_fk')
                ->on('evaluation_schedule_subject_class')
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
        Schema::dropIfExists('evaluation_results');
    }
};
