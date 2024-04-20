<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationFormRequest;
use App\Http\Requests\UpdateEvaluationFormRequest;
use App\Models\EvaluationForm;
use Inertia\Inertia;

class EvaluationFormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $evaluationForms = EvaluationForm::all();

        return Inertia::render('EvaluationForm/List', [
            'evaluationForms' => $evaluationForms
        ]);
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
    public function store(StoreEvaluationFormRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EvaluationForm $evaluationForm)
    {
        $evaluationForm->loadMissing('criteria.indicators');
        return Inertia::render('EvaluationForm/Show', [
            'evaluationForm' => $evaluationForm,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EvaluationForm $evaluationForm)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEvaluationFormRequest $request, EvaluationForm $evaluationForm)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationForm $evaluationForm)
    {
        $evaluationForm->delete();
    }
}
