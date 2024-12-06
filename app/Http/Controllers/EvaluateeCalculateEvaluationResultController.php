<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluateeRequest;
use App\Http\Requests\UpdateEvaluateeRequest;
use App\Models\Evaluatee;
use App\Services\EvaluationResultService;

class EvaluateeCalculateEvaluationResultController extends Controller
{
    public function __construct(
        protected EvaluationResultService $evaluationResultService
    ) {
        
    }


    public function store(
        Evaluatee $evaluatee
    ) {
        if (
            ! $evaluatee->is_open ||
            ! $evaluatee
                ->evaluators()
                ->where('submitted', 1)
                ->exists()
        ) {
            return back()->with(
                'i-evaluate-flash-message',
                [
                    'severity' => 'warning',
                    'value' => 'Evaluation already closed.',
                ]
            );
        }

        $this->evaluationResultService->calculateByEvaluatee($evaluatee);
    }
}
