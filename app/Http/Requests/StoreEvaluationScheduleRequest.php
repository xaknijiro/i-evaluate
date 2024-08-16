<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationScheduleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'academic_year_start' => 'required|date',
            'academic_year_end' => 'required|date',
            'semester' => 'required|exists:semesters,id',
            'evaluation_type' => 'required|exists:evaluation_types,id',
            'evaluation_form' => 'required|exists:evaluation_forms,id',
        ];
    }
}
