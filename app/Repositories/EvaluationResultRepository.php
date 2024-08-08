<?php

namespace App\Repositories;

use App\Models\EvaluationResult;
use App\Models\EvaluationSchedule;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationResultRepository
{
    public function __construct(
        protected EvaluationResult $evaluationResult
    ) {}

    public function saveCalculationResult(array $values): bool
    {
        return (bool)$this->evaluationResult->newQuery()
            ->upsert(
                $values,
                uniqueBy: ['evaluation_schedule_subject_class_id'],
                update:['details']
            );
    }
}
