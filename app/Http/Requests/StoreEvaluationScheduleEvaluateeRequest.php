<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationScheduleEvaluateeRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = [];
        if ($this->has('from_import')) {
            $rules['classes'] = 'required|file|mimes:csv,txt';
        }

        return $rules;
    }
}
