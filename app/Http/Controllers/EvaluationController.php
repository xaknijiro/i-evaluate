<?php

namespace App\Http\Controllers;

use App\Mail\EvaluationPasscodeNotification;
use App\Models\EvaluationPasscode;
use App\Models\EvaluationScheduleSubjectClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    public function __construct(
        protected EvaluationScheduleSubjectClass $evaluationScheduleSubjectClassModel,
        protected EvaluationPasscode $evaluationPasscode,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // initially clear sessions
        $request->session()->forget(['evaluator_email', 'passcode', 'evaluator_passcode']);

        return Inertia::render('Evaluate/Index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'evaluation_code' => 'required|exists:evaluation_schedule_subject_class,code',
            'evaluator_student_id' => 'required',
            'evaluator_email' => 'required|email',
        ]);

        $attributes = $request->only(['evaluation_code', 'evaluator_student_id', 'evaluator_email']);
        $code = $attributes['evaluation_code'];
        $evaluatorStudentId = $attributes['evaluator_student_id'];
        $evaluatorEmail = $attributes['evaluator_email'];

        $evaluationScheduleSubjectClass = $this->evaluationScheduleSubjectClassModel->newQuery()
            ->where('code', $code)
            ->with([
                'subjectClass.semester',
                'subjectClass.subject',
                'subjectClass.course',
                'subjectClass.assignedTo',
            ])
            ->first();

        if (!$evaluationScheduleSubjectClass->is_open) {
            return redirect()
                ->route('evaluation')
                ->with(
                    'i-evaluate-flash-message',
                    [
                        'severity' => 'warning',
                        'value' => "Evaluation is closed for: $code.",
                    ]
                );
        }

        $evaluator = $this->evaluationPasscode->newQuery()
            ->where([
                'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
                'institution_id' => $evaluatorStudentId,
            ])
            ->first();

        $isEmailTaken = $this->evaluationPasscode->newQuery()
            ->where('institution_id', '!=', $evaluatorStudentId)
            ->where([
                'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
                'email' => $evaluatorEmail,
            ])
            ->exists();
        

        if (! $evaluator) {
            return redirect()
                ->route('evaluation')
                ->with(
                    'i-evaluate-flash-message',
                    [
                        'severity' => 'warning',
                        'value' => "You are not eligible to evaluate $code using $evaluatorStudentId.",
                    ]
                );
        }

        if ($evaluator->submitted) {
            return redirect()
                ->route('evaluation')
                ->with(
                    'i-evaluate-flash-message',
                    [
                        'severity' => 'warning',
                        'value' => "Evaluator student ID: $evaluatorStudentId has already submitted evaluation for: $code.",
                    ]
                );
        }

        if (
            $evaluator->email ||
            (is_null($evaluator->email) && $isEmailTaken)
        ) {
            if ($evaluator->email !== $evaluatorEmail) {
                return redirect()
                    ->route('evaluation')
                    ->with(
                        'i-evaluate-flash-message',
                        [
                            'severity' => 'warning',
                            'value' => 'Already been taken by someone else.',
                        ]
                    );
            }
        } else {
            $evaluator->update([
                'email' => $evaluatorEmail,
                'code' => "{$evaluator->id}".Str::upper(Str::random(4)),
            ]);
        }

        $request->session()->put('evaluator_email', $evaluatorEmail);

        Mail::to($evaluatorEmail)->send(new EvaluationPasscodeNotification($evaluator));

        return redirect()->route('evaluation-schedule-subject-class-validate', ['evaluationScheduleSubjectClass' => $evaluationScheduleSubjectClass->id]);
    }
}
