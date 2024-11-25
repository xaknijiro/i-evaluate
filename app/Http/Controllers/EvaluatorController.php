<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluatorRequest;
use App\Http\Requests\UpdateEvaluatorRequest;
use App\Models\Evaluator;
use App\Models\Response;
use App\Services\EvaluationResultService;
use Illuminate\Support\Facades\DB;

class EvaluatorController extends Controller
{
    public function __construct(
        protected EvaluationResultService $evaluationResultService,
        protected Response $responseModel,
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
    public function store(StoreEvaluatorRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Evaluator $evaluator)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Evaluator $evaluator)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEvaluatorRequest $request, Evaluator $evaluator)
    {
        $evaluatee = $evaluator->evaluatee;
        $evaluationSchedule = $evaluatee->evaluationSchedule;
        $evaluationType = $evaluationSchedule->evaluationType;
        $evaluationForm = $evaluationSchedule->evaluationForm;
        $indicators = $evaluationForm->criteria
            ->map(fn ($criterion) => $criterion->indicators)
            ->flatten();
        $responses = $indicators->map(fn ($indicator) => [
            'evaluatee_id' => $evaluatee->id,
            'indicator_id' => $indicator->id,
            'value' => $indicator->criterion->is_weighted ? $request->input("indicator-$indicator->id") : null,
            'comments' => ! $indicator->criterion->is_weighted ? $request->input("indicator-$indicator->id") : null,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        DB::transaction(function () use ($evaluatee, $evaluationType, $evaluator, $responses) {
            DB::table($this->responseModel->getTable())->insert($responses);
            $evaluator->submitted = 1;
            $evaluator->save();
            if ($evaluationType->code === 'self-evaluation') {
                $this->evaluationResultService->calculateByEvaluatee($evaluatee);
            }
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evaluator $evaluator)
    {
        //
    }
}
