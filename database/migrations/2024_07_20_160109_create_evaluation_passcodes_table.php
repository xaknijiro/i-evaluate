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
        Schema::create('evaluation_passcodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_schedule_subject_class_id')
                ->references('id', 'evaluation_passcode_evaluation_schedule_subject_class_fk')
                ->on('evaluation_schedule_subject_class')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->string('institution_id');
            $table->string('email')->nullable();
            $table->string('code')->nullable()->unique();
            $table->timestamp('expires_at');
            $table->boolean('submitted')->default(false);
            $table->unique([
                'evaluation_schedule_subject_class_id',
                'institution_id',
            ], 'unique_evaluation_subject_class_institution_id');
            $table->unique([
                'evaluation_schedule_subject_class_id',
                'email',
            ], 'unique_evaluation_subject_class_email');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_passcodes');
    }
};
