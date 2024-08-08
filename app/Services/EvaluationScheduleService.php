<?php

namespace App\Services;

use App\Models\EvaluationSchedule;
use App\Repositories\EvaluationScheduleRepository;

class EvaluationScheduleService
{
    public function __construct(
        protected EvaluationScheduleRepository $evaluationScheduleRepository,
    ) {}

    public function getLatestEvaluationSchedule(): ?EvaluationSchedule
    {
        $latestEvaluationSchedule = $this->evaluationScheduleRepository->getLatestEvaluationSchedule();

        if ($latestEvaluationSchedule) {
            $latestEvaluationSchedule->evaluatees = $latestEvaluationSchedule->subjectClasses
            ->groupBy('assigned_to')
            ->map(fn ($group) => $group->first()->assignedTo)
            ->values();
        }
        
        return $latestEvaluationSchedule;
    }
}
