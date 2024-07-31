<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEvaluationScheduleSubjectClassRequest;
use App\Mail\EvaluationCompleteNotification;
use App\Mail\EvaluationPasscodeNotification;
use App\Models\EvaluationPasscode;
use App\Models\EvaluationResponse;
use App\Models\EvaluationScheduleSubjectClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EvaluationScheduleSubjectClassController extends Controller
{
    public function __construct(
        protected EvaluationPasscode $evaluationPasscode,
        protected EvaluationResponse $evaluationResponse
    ) {}

    public function index(Request $request, EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass)
    {
        if (! $request->session()->has('evaluator_email')) {
            return redirect()->route('evaluation');
        }

        if ($request->session()->has('evaluator_passcode')) {
            return redirect()->route('evaluate-scheduled-subject', ['evaluationScheduleSubjectClass' => $evaluationScheduleSubjectClass->id]);
        }

        $id = $evaluationScheduleSubjectClass->id;
        $code = $evaluationScheduleSubjectClass->code;
        $subjectClass = $evaluationScheduleSubjectClass->subjectClass;
        $subject = $subjectClass->subject->only(['code', 'title']);
        $academicYear = $subjectClass->academic_year;
        $semester = $subjectClass->semester->title;
        $course = $subjectClass->course->only(['code', 'title']);
        $yearLevel = $subjectClass->year_level;
        $assignedTo = $subjectClass->assignedTo->name;
        $evaluatorEmail = $request->session()->get('evaluator_email');

        return Inertia::render('Evaluate/ScheduledSubject/Index', [
            'id' => $id,
            'code' => $code,
            'subject' => $subject,
            'academicYear' => $academicYear,
            'semester' => $semester,
            'course' => $course,
            'yearLevel' => $yearLevel,
            'assignedTo' => $assignedTo,
            'evaluatorEmail' => $evaluatorEmail,
        ]);
    }

    public function show(Request $request, EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass)
    {
        if (
            ! $request->session()->has('evaluator_email') ||
            ! $request->session()->has('evaluator_passcode')
        ) {
            return redirect()->route('evaluation');
        }

        $id = $evaluationScheduleSubjectClass->id;
        $evaluatorEmail = $request->session()->get('evaluator_email');
        $evaluatorPasscode = $request->session()->get('evaluator_passcode');

        $evaluationPasscode = $this->evaluationPasscode->newQuery()
            ->where([
                'evaluation_schedule_subject_class_id' => $id,
                'email' => $evaluatorEmail,
            ])
            ->with([
                'evaluationScheduleSubjectClass.evaluationSchedule.evaluationForm.criteria.indicators',
                'evaluationScheduleSubjectClass.evaluationSchedule.evaluationForm.likertScale',
                'evaluationScheduleSubjectClass.evaluationSchedule.evaluationType',
            ])
            ->first();

        if (
            ! $evaluationPasscode ||
            $evaluationPasscode->submitted ||
            ! Hash::check($evaluationPasscode->code, $evaluatorPasscode)
        ) {
            return redirect()->route('evaluation');
        }

        $code = $evaluationScheduleSubjectClass->code;
        $subjectClass = $evaluationScheduleSubjectClass->subjectClass;
        $subject = $subjectClass->subject->only(['code', 'title']);
        $academicYear = $subjectClass->academic_year;
        $semester = $subjectClass->semester->title;
        $course = $subjectClass->course->only(['code', 'title']);
        $yearLevel = $subjectClass->year_level;
        $assignedTo = $subjectClass->assignedTo->name;
        $evaluationType = $evaluationPasscode->evaluationScheduleSubjectClass->evaluationSchedule->evaluationType->title;
        $evaluationForm = $evaluationPasscode->evaluationScheduleSubjectClass->evaluationSchedule->evaluationForm;

        return Inertia::render('Evaluate/ScheduledSubject/Show', [
            'id' => $id,
            'code' => $code,
            'subject' => $subject,
            'academicYear' => $academicYear,
            'semester' => $semester,
            'course' => $course,
            'yearLevel' => $yearLevel,
            'assignedTo' => $assignedTo,
            'evaluationType' => $evaluationType,
            'evaluationForm' => $evaluationForm,
        ]);
    }

    public function update(
        UpdateEvaluationScheduleSubjectClassRequest $request,
        EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {
        $evaluatorEmail = $request->session()->get('evaluator_email');
        $id = $evaluationScheduleSubjectClass->id;
        $evaluationForm = $evaluationScheduleSubjectClass->evaluationSchedule->evaluationForm;
        $indicators = $evaluationForm->criteria
            ->map(fn ($criterion) => $criterion->indicators)
            ->flatten();
        $evaluationPasscodeId = $request->input('evaluation_passcode_id');
        $responses = $indicators->map(fn ($indicator) => [
            'evaluation_schedule_subject_class_id' => $id,
            'indicator_id' => $indicator->id,
            'value' => $request->input("indicator-$indicator->id"),
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        DB::table($this->evaluationResponse->getTable())->insert($responses);

        $this->evaluationPasscode->newQuery()
            ->where('id', $evaluationPasscodeId)
            ->update([
                'submitted' => true,
            ]);

        Mail::to($evaluatorEmail)->send(new EvaluationCompleteNotification($evaluationScheduleSubjectClass));

        $request->session()->forget(['evaluator_email', 'evaluator_passcode']);

        return redirect()->route('evaluation')->with(
            'i-evaluate-flash-message',
            [
                'severity' => 'success',
                'value' => 'Success! Evaluation responses recorded.',
            ]
        );
    }

    public function validate(Request $request, EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass)
    {
        if (! $request->session()->has('evaluator_email')) {
            return redirect()->route('evaluation');
        }

        $evaluatorEmail = $request->session()->get('evaluator_email');

        $request->validate([
            'passcode' => [
                'required',
                Rule::exists(EvaluationPasscode::class, 'code')
                    ->where('evaluation_schedule_subject_class_id', $evaluationScheduleSubjectClass->id)
                    ->where('email', $evaluatorEmail),
            ],
        ]);

        $attributes = $request->only(['passcode']);
        $passcode = $attributes['passcode'];

        session(['evaluator_passcode' => Hash::make($passcode)]);

        return redirect()->route('evaluate-scheduled-subject', ['evaluationScheduleSubjectClass' => $evaluationScheduleSubjectClass->id]);
    }
}
