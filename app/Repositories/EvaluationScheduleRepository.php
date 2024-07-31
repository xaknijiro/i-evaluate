<?php

namespace App\Repositories;

use App\Models\EvaluationSchedule;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationScheduleRepository
{
    public function __construct(
        protected EvaluationSchedule $evaluationSchedule
    ) {}

    public function getLatestEvaluationSchedule()
    {
        return $this->evaluationSchedule
            ->newQuery()
            ->where('is_open', 1)
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester_id', 'desc')
            ->with([
                'semester',
                'subjectClasses.subject',
                'subjectClasses.course',
                'subjectClasses.assignedTo',
                'evaluationScheduleSubjectClasses' => function (HasMany $query) {
                    $query->withCount([
                        'evaluationPasscodes as respondents_count',
                        'evaluationPasscodes as respondents_submitted_count' => function ($query) {
                            $query->where('submitted', 1);
                        },
                    ]);
                },
            ])
            ->withCount([
                'subjectClasses',
                'subjectClasses as subject_classes_count_open' => function ($query) {
                    $query->where('is_open', 1);
                },
                'subjectClasses as subject_classes_count_closed' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },
            ])
            ->first();
    }
}
