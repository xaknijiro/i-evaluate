<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationScheduleRequest;
use App\Http\Requests\UpdateEvaluationScheduleRequest;
use App\Models\EvaluationSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationScheduleController extends Controller
{
    public function __construct(
        protected EvaluationSchedule $evaluationScheduleModel
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);

        $evaluationSchedules = $this->evaluationScheduleModel->newQuery()
            ->orderBy('academic_year', 'desc')
            ->with(['evaluationForm', 'evaluationType', 'semester'])
            ->withCount([
                'subjectClasses',
                'subjectClasses as subject_classes_count_open' => function ($query) {
                    $query->where('is_open', 1);
                },
                'subjectClasses as subject_classes_count_closed' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },
            ])
            ->paginate($perPage);

        return Inertia::render('EvaluationSchedule/List', [
            'evaluationSchedules' => $evaluationSchedules,
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
