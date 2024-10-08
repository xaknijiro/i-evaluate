<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationFormResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'likert_scale' => $this->likertScale,
            'criteria' => EvaluationCriterionResource::collection($this->criteria),
        ];
    }
}
