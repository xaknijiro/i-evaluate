<?php

namespace App\Http\Controllers;

use App\Http\Resources\EvaluateeOverallEvaluationResultResource;
use App\Http\Resources\SummativeReportResource;
use App\Models\EvaluationSchedule;
use App\Services\EvaluationScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportOverallEvaluationResultEvaluateeController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, String $academicYear, int $semesterId) {
        $perPage = $request->input('per_page', 5);
        $evaluatees = $this->evaluationScheduleService->getEvaluateesByAcademicYearAndSemester($academicYear, $semesterId, [], $perPage);
        return Inertia::render('Report/OverallEvaluationResult/Evaluatee/List', [
            'academic_year' => $academicYear,
            'semester_id' => $semesterId, 
            'evaluatees' => EvaluateeOverallEvaluationResultResource::collection($evaluatees),
        ]);
    }
}
