<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentResource;
use App\Http\Resources\EvaluateeOverallEvaluationResultResource;
use App\Services\DepartmentService;
use App\Services\EvaluationScheduleService;
use App\Services\SemesterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportOverallEvaluationResultEvaluateeController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService,
        protected DepartmentService $departmentService,
        protected SemesterService $semesterService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, string $academicYear, int $semesterId)
    {
        $filters = $request->all();
        $perPage = $request->input('per_page', 5);
        $evaluatees = $this->evaluationScheduleService->getEvaluateesByAcademicYearAndSemester($academicYear, $semesterId, $filters, $perPage);
        $semester = $this->semesterService->getSemesterById($semesterId);

        return Inertia::render('Report/OverallEvaluationResult/Evaluatee/List', [
            'academic_year' => $academicYear,
            'semester_id' => $semesterId,
            'semester' => $semester->title,
            'filters' => $filters,
            'departments' => DepartmentResource::collection($this->departmentService->getDepartments()),
            'evaluatees' => EvaluateeOverallEvaluationResultResource::collection($evaluatees),
        ]);
    }
}
