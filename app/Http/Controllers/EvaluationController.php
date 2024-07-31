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
            'evaluator_email' => 'required|email',
        ]);

        $attributes = $request->only(['evaluation_code', 'evaluator_email', 'passcode']);
        $code = $attributes['evaluation_code'];
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

        $evaluator = $this->evaluationPasscode->newQuery()
            ->firstOrCreate(
                [
                    'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
                    'email' => $evaluatorEmail,
                ],
                [
                    'code' => $evaluationScheduleSubjectClass->id.'-'.Str::random(8),
                    'expires_at' => now()->addMinutes(30),
                ]
            );

        if ($evaluator->submitted) {
            return redirect()
                ->route('evaluation')
                ->with(
                    'i-evaluate-flash-message',
                    [
                        'severity' => 'warning',
                        'value' => "Already evaluated $code using email $evaluatorEmail.",
                    ]
                );
        }

        $request->session()->put('evaluator_email', $evaluatorEmail);

        Mail::to($evaluatorEmail)->send(new EvaluationPasscodeNotification($evaluator));

        return redirect()->route('evaluation-schedule-subject-class-validate', ['evaluationScheduleSubjectClass' => $evaluationScheduleSubjectClass->id]);
    }
}
