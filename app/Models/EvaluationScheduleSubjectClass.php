<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;

class EvaluationScheduleSubjectClass extends Pivot
{
    use HasFactory;

    public $incrementing = true;

    protected $fillable = [
        'code',
        'evaluation_schedule_id',
        'subject_class_id',
        'is_open',
    ];

    public function subjectClass(): BelongsTo
    {
        return $this->belongsTo(SubjectClass::class);
    }

    public function evaluationSchedule(): BelongsTo
    {
        return $this->belongsTo(EvaluationSchedule::class);
    }

    public function evaluationPasscodes(): HasMany
    {
        return $this->hasMany(EvaluationPasscode::class, 'evaluation_schedule_subject_class_id');
    }

    public function evaluationResult(): HasOne
    {
        return $this->hasOne(EvaluationResult::class, 'evaluation_schedule_subject_class_id');        
    }
}
