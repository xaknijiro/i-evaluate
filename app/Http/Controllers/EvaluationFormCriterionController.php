<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCriterionRequest;
use App\Http\Requests\UpdateCriterionRequest;
use App\Models\Criterion;
use App\Models\EvaluationForm;
use Illuminate\Support\Facades\Log;

class EvaluationFormCriterionController extends Controller
{
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
    public function store(StoreCriterionRequest $request, EvaluationForm $evaluationForm)
    {
        $criterion = $evaluationForm->criteria()->create($request->only(['description', 'weight']));
        $criterion->indicators()->createMany($request->input('indicators'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Criterion $criterion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Criterion $criterion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCriterionRequest $request, EvaluationForm $evaluationForm, Criterion $criterion)
    {
        if (
            $evaluationForm->published ||
            !$evaluationForm->criteria->pluck('id')->contains($criterion->id)
        ) {
            abort(400);
        }
        
        $criterion->update($request->only('description', 'weight'));
        $criterion->indicators()->delete();
        $criterion->indicators()->createMany($request->input('indicators'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationForm $evaluationForm, Criterion $criterion)
    {
        if (
            $evaluationForm->published ||
            !$evaluationForm->criteria->pluck('id')->contains($criterion->id)
        ) {
            abort(400);
        }
        $criterion->delete();
    }
}
