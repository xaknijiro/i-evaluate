<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluation_schedule_subject_class_id' => $this->evaluation_schedule_subject_class_id,
            'details' => $this->details,
            'remarks' => $this->remarks,
            'is_released' => $this->is_released,
        ];
    }
}
