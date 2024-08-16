<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationScheduleEvaluateeRequest;
use App\Http\Resources\EvaluateeResource;
use App\Http\Resources\EvaluationScheduleResource;
use App\Models\Course;
use App\Models\EvaluationSchedule;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Models\User;
use App\Services\EvaluationScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EvaluationScheduleEvaluateeController extends Controller
{
    public function __construct(
        protected Course $courseModel,
        protected EvaluationScheduleService $evaluationScheduleService,
        protected Subject $subjectModel,
        protected SubjectClass $subjectClassModel,
        protected User $userModel,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(EvaluationSchedule $evaluationSchedule)
    {
        $evaluationScheduleEvaluatees = $this->evaluationScheduleService->getEvaluatees($evaluationSchedule);

        //return $evaluationScheduleEvaluatees;

        return Inertia::render('EvaluationSchedule/Evaluatee/List', [
            'evaluationSchedule' => EvaluationScheduleResource::make($evaluationSchedule),
            'evaluatees' => EvaluateeResource::collection($evaluationScheduleEvaluatees),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEvaluationScheduleEvaluateeRequest $request, EvaluationSchedule $evaluationSchedule)
    {
        $filename = $request->file('classes');
        $fileHandle = fopen($filename, 'r');
        $headers = fgetcsv($fileHandle);

        if ([
            'SECTION',
            'SUBJECT CODE',
            'COURSE CODE',
            'YEAR LEVEL',
            'SCHEDULE',
            'ASSIGNED TO',
        ] !== $headers) {
            fclose($fileHandle);

            return back()->with([
                'i-evaluate-flash-message' => [
                    'severity' => 'error',
                    'value' => 'Invalid import template.',
                ],
            ]);
        }

        $academicYear = $evaluationSchedule->academic_year;
        $semesterId = $evaluationSchedule->semester_id;
        $batchImportRefernce = Hash::make(now());

        $subjectClasses = [];
        while ($row = fgetcsv($fileHandle)) {
            $subject = $this->subjectModel->newQuery()
                ->where('code', $row[1])
                ->first();
            $course = $this->courseModel->newQuery()
                ->where('code', $row[2])
                ->first();
            $assignedTo = $this->userModel->newQuery()
                ->where('institution_id', $row[5])
                ->first();
            $assignedTo = $assignedTo ?? $this->userModel->newQuery()
                ->where('email', $row[5])
                ->first();
            if (! ($subject && $course && $assignedTo)) {
                continue;
            }
            $subjectClasses[] = [
                'academic_year' => $academicYear,
                'semester_id' => $semesterId,
                'section' => $row[0],
                'subject_id' => $subject->id,
                'course_id' => $course->id,
                'year_level' => $row[3],
                'schedule' => $row[4],
                'assigned_to' => $assignedTo->id,
                'batch_import_reference' => $batchImportRefernce,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        fclose($fileHandle);

        $this->subjectClassModel->newQuery()
            ->upsert(
                $subjectClasses,
                ['academic_year', 'semester_id', 'section', 'subject_id'],
                ['academic_year', 'semester_id', 'section', 'subject_id']
            );

        $subjectClasses = $this->subjectClassModel->newQuery()
            ->where('batch_import_reference', $batchImportRefernce)
            ->get();

        $evaluationSchedule->subjectClasses()->attach($subjectClasses->mapWithKeys(fn ($subjectClass) => [
            $subjectClass->id => [
                'code' => "{$evaluationSchedule->id}-{$subjectClass->id}-".Str::upper(Str::random(4)),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]));

        Session::flash('i-evaluate-flash-message', [
            'severity' => 'success',
            'value' => 'Import success.',
        ]);
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
    public function update(Request $request, EvaluationSchedule $evaluationSchedule)
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

    public function downloadTemplate()
    {
        return response()->download(storage_path('import_templates/classes.csv'));
    }
}
