<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year',
        'semester_id',
        'evaluation_type_id',
        'evaluation_form_id',
        'is_open',
    ];

    protected $casts = [
        'is_open' => 'bool',
    ];

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function evaluationForm(): BelongsTo
    {
        return $this->belongsTo(EvaluationForm::class);
    }

    public function evaluationType(): BelongsTo
    {
        return $this->belongsTo(EvaluationType::class);
    }

    public function subjectClasses(): BelongsToMany
    {
        return $this->belongsToMany(SubjectClass::class)
            ->withPivot([
                'id',
                'code',
                'is_open',
            ]);
    }

    public function evaluationScheduleSubjectClasses(): HasMany
    {
        return $this->hasMany(EvaluationScheduleSubjectClass::class);
    }

    public function evaluatees(): HasMany
    {
        return $this->hasMany(Evaluatee::class);
    }
}
