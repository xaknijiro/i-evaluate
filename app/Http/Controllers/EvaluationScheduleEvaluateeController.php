<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationScheduleRequest;
use App\Http\Requests\UpdateEvaluationScheduleRequest;
use App\Http\Resources\EvaluateeResource;
use App\Http\Resources\EvaluationResource;
use App\Models\EvaluationSchedule;
use App\Services\EvaluationScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationScheduleEvaluateeController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(EvaluationSchedule $evaluationSchedule)
    {
        $evaluationScheduleEvaluatees = $this->evaluationScheduleService->getEvaluatees($evaluationSchedule);
        return Inertia::render('EvaluationSchedule/Evaluatee/List', [
            'evaluationSchedule' => EvaluationResource::make($evaluationSchedule),
            'evaluatees' => EvaluateeResource::collection($evaluationScheduleEvaluatees),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEvaluationScheduleRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EvaluationSchedule $evaluationSchedule)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEvaluationScheduleRequest $request, EvaluationSchedule $evaluationSchedule)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationSchedule $evaluationSchedule)
    {
        //
    }
}
