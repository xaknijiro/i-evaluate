<?php

use App\Models\EvaluationForm;
use App\Models\EvaluationType;
use App\Models\Semester;
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
        Schema::create('evaluation_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year');
            $table->foreignIdFor(Semester::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignIdFor(EvaluationType::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignIdFor(EvaluationForm::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->boolean('is_open')->default(true);
            $table->unique(
                ['academic_year', 'semester_id', 'evaluation_type_id'],
                'evaluation_schedule_unique'
            );
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_schedules');
    }
};
