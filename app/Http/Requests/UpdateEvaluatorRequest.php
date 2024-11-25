<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateEvaluatorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $evaluator = $this->evaluator;

        return Auth::user()->id === $evaluator->user_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $evaluationForm = $this->evaluator->evaluatee->evaluationSchedule->evaluationForm;

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
