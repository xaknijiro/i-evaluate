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
            $table->string('email');
            $table->string('code')->unique();
            $table->timestamp('expires_at');
            $table->boolean('submitted')->default(false);
            $table->unique([
                'evaluation_schedule_subject_class_id',
                'email',
            ], 'evaluation_schedule_subject_class_evaluator_email_unique');
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
