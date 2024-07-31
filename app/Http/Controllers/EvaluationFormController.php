<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationFormRequest;
use App\Http\Requests\UpdateEvaluationFormRequest;
use App\Models\EvaluationForm;
use App\Models\LikertScale;
use Inertia\Inertia;

class EvaluationFormController extends Controller
{
    public function __construct(
        protected EvaluationForm $evaluationForm
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $evaluationForms = EvaluationForm::all();

        return Inertia::render('EvaluationForm/List', [
            'evaluationForms' => $evaluationForms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEvaluationFormRequest $request)
    {
        $attributes = $request->only(['title']);
        $attributes['likert_scale_id'] = LikertScale::where('code', '5-point-scale')->first()->id;
        $newEvaluationForm = $this->evaluationForm->newQuery()->create($attributes);

        return redirect("evaluation-forms/$newEvaluationForm->id");
    }

    /**
     * Display the specified resource.
     */
    public function show(EvaluationForm $evaluationForm)
    {
        $evaluationForm->loadMissing([
            'likertScale',
            'criteria.indicators',
        ]);

        return Inertia::render('EvaluationForm/Show', [
            'evaluationForm' => $evaluationForm,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEvaluationFormRequest $request, EvaluationForm $evaluationForm)
    {
        $evaluationForm->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationForm $evaluationForm)
    {
        $evaluationForm->delete();
    }
}
