<?php

namespace App\Http\Controllers;

use App\Http\Resources\SummativeReportResource;
use App\Services\EvaluationScheduleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportOverallEvaluationResultController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $summativeReportList = $this->evaluationScheduleService->getAllAcademicYearsAndSemesters($perPage);

        return Inertia::render('Report/OverallEvaluationResult/List', [
            'summativeReportList' => SummativeReportResource::collection($summativeReportList),
        ]);
    }
}
