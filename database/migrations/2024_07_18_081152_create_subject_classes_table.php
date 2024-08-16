<?php

use App\Models\Course;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\User;
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
        Schema::create('subject_classes', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year');
            $table->foreignIdFor(Semester::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->string('section');
            $table->foreignIdFor(Subject::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->foreignIdFor(Course::class)
                ->constrained()
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->tinyInteger('year_level');
            $table->string('schedule')->nullable();
            $table->unsignedBigInteger('assigned_to');
            $table->foreign('assigned_to')
                ->references('id')
                ->on((new User)->getTable())
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->string('batch_import_reference')->nullable();
            $table->unique(['academic_year', 'semester_id', 'section', 'subject_id'], 'unique_subject_class');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subject_classes');
    }
};
