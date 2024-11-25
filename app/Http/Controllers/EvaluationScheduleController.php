<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationScheduleRequest;
use App\Http\Requests\UpdateEvaluationScheduleRequest;
use App\Http\Resources\EvaluationFormResource;
use App\Http\Resources\EvaluationScheduleResource;
use App\Http\Resources\EvaluationTypeResource;
use App\Http\Resources\SemesterResource;
use App\Models\EvaluationSchedule;
use App\Models\EvaluationScheduleSubjectClass;
use App\Services\EvaluationFormService;
use App\Services\EvaluationResultService;
use App\Services\EvaluationScheduleService;
use App\Services\EvaluationTypeService;
use App\Services\SemesterService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluationScheduleController extends Controller
{
    public function __construct(
        protected EvaluationFormService $evaluationFormService,
        protected EvaluationResultService $evaluationResultService,
        protected EvaluationSchedule $evaluationScheduleModel,
        protected EvaluationScheduleService $evaluationScheduleService,
        protected EvaluationTypeService $evaluationTypeService,
        protected SemesterService $semesterService,
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
                'subjectClasses as subject_classes_open_count' => function ($query) {
                    $query->where('is_open', 1);
                },
                'subjectClasses as subject_classes_closed_count' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },

                'evaluatees',
                'evaluatees as evaluatees_open_count' => function ($query) {
                    $query->where('is_open', 1);
                },
                'evaluatees as evaluatees_closed_count' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },
            ])
            ->paginate($perPage);

        $semesters = $this->semesterService->getSemesters();
        $evaluationTypes = $this->evaluationTypeService->getEvaluationTypes();
        $evaluationForms = $this->evaluationFormService->getEvaluationForms();

        return Inertia::render('EvaluationSchedule/List', [
            'evaluationSchedules' => EvaluationScheduleResource::collection($evaluationSchedules),
            'evaluationTypes' => EvaluationTypeResource::collection($evaluationTypes),
            'evaluationForms' => EvaluationFormResource::collection($evaluationForms),
            'semesters' => SemesterResource::collection($semesters),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEvaluationScheduleRequest $request)
    {
        $data = $request->only([
            'academic_year_start',
            'academic_year_end',
            'semester',
            'evaluation_type',
            'evaluation_form',
        ]);

        $data['academic_year_start'] = Carbon::parse($data['academic_year_start'])->format('Y');
        $data['academic_year_end'] = Carbon::parse($data['academic_year_end'])->format('Y');

        $data['academic_year'] = $data['academic_year_start'].'-'.$data['academic_year_end'];
        $data['semester_id'] = $data['semester'];
        $data['evaluation_type_id'] = $data['evaluation_type'];
        $data['evaluation_form_id'] = $data['evaluation_form'];

        unset(
            $data['academic_year_start'],
            $data['academic_year_end'],
            $data['semester'],
            $data['evaluation_type'],
            $data['evaluation_form']
        );

        DB::transaction(function () use (&$evaluationSchedule, $data) {
            $evaluationSchedule = $this->evaluationScheduleService->create($data);
            if ($evaluationSchedule->evaluationType->code !== 'student-to-teacher-evaluation') {
                $this->evaluationScheduleService->populateEntries($evaluationSchedule);
            }

            return redirect("evaluation-schedules/$evaluationSchedule->id/evaluatees");
        });
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
        DB::transaction(function () use ($evaluationSchedule) {
            $evaluationSubjectClasses = $evaluationSchedule->evaluationScheduleSubjectClasses;
            $evaluationSubjectClasses->whereInstanceOf(EvaluationScheduleSubjectClass::class)
                ->each(function (EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass) {
                    $this->evaluationResultService->calculate($evaluationScheduleSubjectClass);
                });
            if ($evaluationSchedule->evaluationScheduleSubjectClasses()->where('is_open', 1)->doesntExist()) {
                $evaluationSchedule->is_open = 0;
                $evaluationSchedule->save();
            }
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EvaluationSchedule $evaluationSchedule)
    {
        $evaluationSchedule->subjectClasses()->delete();
        $evaluationSchedule->delete();
    }
}
