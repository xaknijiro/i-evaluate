<?php

namespace App\Repositories;

use App\Models\Result;

class ResultRepository
{
    public function __construct(
        protected Result $result
    ) {}

    public function saveCalculationResult(array $values): bool
    {
        return (bool) $this->result->newQuery()
            ->upsert(
                $values,
                uniqueBy: ['evaluatee_id'],
                update: ['details']
            );
    }
}
