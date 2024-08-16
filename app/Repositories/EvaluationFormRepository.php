<?php

namespace App\Repositories;

use App\Models\EvaluationForm;
use Illuminate\Database\Eloquent\Collection;

class EvaluationFormRepository
{
    public function __construct(
        protected EvaluationForm $evaluationForm
    ) {}

    public function getEvaluationForms(): Collection
    {
        return $this->evaluationForm->newQuery()
            ->orderBy('title')
            ->get();
    }
}
