<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationResultRequest;
use App\Http\Requests\UpdateEvaluationResultRequest;
use App\Models\EvaluationResult;
use App\Models\EvaluationScheduleSubjectClass;
use App\Services\EvaluationResultService;

class EvaluationResultController extends Controller
{
    public function __construct(
        protected EvaluationResultService $evaluationResultService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreEvaluationResultRequest $request,
        EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {
        if (
            ! $evaluationScheduleSubjectClass->is_open ||
            ! $evaluationScheduleSubjectClass
                ->evaluationPasscodes()
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

        $this->evaluationResultService->calculate($evaluationScheduleSubjectClass);
    }

    /**
     * Display the specified resource.
     */
    public function show(EvaluationResult $evaluationResult)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EvaluationResult $evaluationResult)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEvaluationResultRequest $request, EvaluationResult $evaluationResult)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationResult $evaluationResult)
    {
        //
    }
}
