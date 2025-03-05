<?php

namespace App\Http\Controllers;

use App\Http\Resources\DepartmentResource;
use App\Http\Resources\EvaluateeOverallEvaluationResultResource;
use App\Services\DepartmentService;
use App\Services\EvaluationScheduleService;
use App\Services\SemesterService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Intervention\Image\Laravel\Facades\Image;

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

        try {
            $filePath = storage_path("logos/logo-kcp-report-header.jpg");
            $reportHeader = Image::read(File::get($filePath))->toJpeg()->toDataUri();
        } catch (Exception $e) {
            $reportHeader = null;
        }

        return Inertia::render('Report/OverallEvaluationResult/Evaluatee/List', [
            'academic_year' => $academicYear,
            'semester_id' => $semesterId,
            'semester' => $semester->title,
            'filters' => $filters,
            'departments' => DepartmentResource::collection($this->departmentService->getDepartments()),
            'evaluatees' => EvaluateeOverallEvaluationResultResource::collection($evaluatees),
            'reportHeader' => $reportHeader,
        ]);
    }
}
