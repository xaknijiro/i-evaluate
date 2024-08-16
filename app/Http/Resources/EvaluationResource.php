<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'is_open' => $this->is_open,
            'evaluators' => $this->evaluationPasscodes,
            'evaluators_count' => $this->evaluation_passcodes_count,
            'evaluators_count_submitted' => $this->evaluation_passcodes_count_submitted,
            'result' => $this->when(
                ! $this->is_open && $this->evaluationResult,
                EvaluationResultResource::make($this->evaluationResult)
            ),
        ];
    }
}
