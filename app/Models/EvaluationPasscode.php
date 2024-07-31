<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationPasscode extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_schedule_subject_class_id',
        'email',
        'code',
        'expires_at',
    ];

    public function evaluationScheduleSubjectClass(): BelongsTo
    {
        return $this->belongsTo(EvaluationScheduleSubjectClass::class);
    }
}
