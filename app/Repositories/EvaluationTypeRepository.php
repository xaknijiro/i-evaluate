<?php

namespace App\Repositories;

use App\Models\EvaluationType;
use Illuminate\Database\Eloquent\Collection;

class EvaluationTypeRepository
{
    public function __construct(
        protected EvaluationType $evaluationType
    ) {}

    public function getEvaluationTypes(): Collection
    {
        return $this->evaluationType->newQuery()
            ->orderBy('title')
            ->get();
    }
}
