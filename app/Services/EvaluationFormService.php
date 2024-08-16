<?php

namespace App\Services;

use App\Repositories\EvaluationFormRepository;
use Illuminate\Database\Eloquent\Collection;

class EvaluationFormService
{
    public function __construct(
        protected EvaluationFormRepository $evaluationFormRepository,
    ) {}

    public function getEvaluationForms(): Collection
    {
        return $this->evaluationFormRepository->getEvaluationForms();
    }
}
