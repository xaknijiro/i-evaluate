<?php

namespace App\Http\Requests;

use App\Models\EvaluationPasscode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class UpdateEvaluationScheduleSubjectClassRequest extends FormRequest
{
    public function rules(EvaluationPasscode $evaluationPasscodeModel): array
    {
        if (
            ! $this->session()->has('evaluator_email') ||
            ! $this->session()->has('evaluator_passcode')
        ) {
            return redirect()->route('evaluation');
        }

        $this->evaluationScheduleSubjectClass->loadMissing('evaluationSchedule.evaluationForm.criteria.indicators');

        $id = $this->evaluationScheduleSubjectClass->id;
        $evaluatorEmail = $this->session()->get('evaluator_email');
        $evaluatorPasscode = $this->session()->get('evaluator_passcode');
        $evaluationForm = $this->evaluationScheduleSubjectClass->evaluationSchedule->evaluationForm;

        $evaluationPasscode = $evaluationPasscodeModel->newQuery()
            ->where([
                'evaluation_schedule_subject_class_id' => $id,
                'email' => $evaluatorEmail,
            ])
            ->first();

        if (! $evaluationPasscode || ! Hash::check($evaluationPasscode->code, $evaluatorPasscode)) {
            return redirect()->route('evaluation');
        }

        $this->merge([
            'evaluation_passcode_id' => $evaluationPasscode->id,
        ]);

        $indicatorsRule = $evaluationForm->criteria
            ->map(fn ($criterion) => $criterion->indicators)
            ->flatten()
            ->mapWithKeys(function ($indicator) {
                return [
                    "indicator-$indicator->id" => 'required',
                ];
            })
            ->toArray();

        return $indicatorsRule;
    }
}
