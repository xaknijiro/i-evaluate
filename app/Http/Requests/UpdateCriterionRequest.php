<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateCriterionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $status = request()->input('status', 'save');

        $rules = [
            'description' => 'sometimes|required',
            'weight' => '',
            'indicators.*.description' => '',
        ];

        if ($status === 'publish') {
            $rules['description'] = 'required';
            $rules['weight'] = 'required';
            $rules['indicator.*.description'] = 'required';
        }

        return $rules;
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->failed()) {
                    $validator->errors()->add(
                        'criterion_id',
                        $this->criterion->id,
                    );
                }
            },
        ];
    }
}
