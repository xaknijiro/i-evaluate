<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class SubjectClass extends Model
{
    use HasFactory;

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function evaluationSchedule(): HasOneThrough
    {
        return $this->hasOneThrough(
            EvaluationSchedule::class,
            EvaluationScheduleSubjectClass::class,
            'subject_class_id',
            'id',
            'id',
            'evaluation_schedule_id'
        );
    }

    public function evaluationScheduleSubjectClass(): HasOne
    {
        return $this->hasOne(EvaluationScheduleSubjectClass::class);
    }
}
