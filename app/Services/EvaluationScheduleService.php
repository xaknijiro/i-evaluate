<?php

namespace App\Services;

use App\Repositories\EvaluationScheduleRepository;

class EvaluationScheduleService
{
    public function __construct(
        protected EvaluationScheduleRepository $evaluationScheduleRepository,
    ) {}

    public function getLatestEvaluationSchedule()
    {
        return $this->evaluationScheduleRepository->getLatestEvaluationSchedule();
    }
}
