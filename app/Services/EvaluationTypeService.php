<?php

namespace App\Services;

use App\Models\EvaluationType;
use App\Repositories\EvaluationTypeRepository;
use Illuminate\Database\Eloquent\Collection;

class EvaluationTypeService
{
    public function __construct(
        protected EvaluationTypeRepository $evaluationTypeRepository,
    ) {}

    public function getEvaluationTypes(): Collection
    {
        return $this->evaluationTypeRepository->getEvaluationTypes()
            ->filter(fn (EvaluationType $evaluationType) => $evaluationType->code === 'student-to-teacher-evaluation');
    }
}
