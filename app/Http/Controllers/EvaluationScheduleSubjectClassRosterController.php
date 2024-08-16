<?php

namespace App\Http\Controllers;

use App\Models\EvaluationPasscode;
use App\Models\EvaluationSchedule;
use App\Models\EvaluationScheduleSubjectClass;
use Illuminate\Http\Request;

class EvaluationScheduleSubjectClassRosterController extends Controller
{
    public function __construct(
        protected EvaluationPasscode $evaluationPasscodeModel,
    ) {}

    public function index(
        Request $request,
        EvaluationSchedule $evaluationSchedule,
        EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {}

    public function store(
        Request $request,
        EvaluationSchedule $evaluationSchedule,
        EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass
    ) {
        $request->validate([
            'class_roster' => 'required',
        ]);

        $classRoster = explode(PHP_EOL, $request->input('class_roster'));
        $classRoster = array_map('trim', $classRoster);
        $classRoster = array_unique(array_filter($classRoster));
        $classRoster = array_values($classRoster);

        $classRoster = array_map(function ($institutionId) use ($evaluationScheduleSubjectClass) {
            return [
                'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
                'institution_id' => $institutionId,
                'expires_at' => now()->addDay(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $classRoster);

        $this->evaluationPasscodeModel->newQuery()
            ->upsert(
                $classRoster,
                ['evaluation_schedule_subject_class_id', 'institution_id'],
            );
    }
}
