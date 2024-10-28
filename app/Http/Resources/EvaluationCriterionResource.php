<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationCriterionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'is_weighted' => $this->is_weighted,
            'weight' => $this->weight,
            'indicators' => EvaluationIndicatorResource::collection($this->indicators),
        ];
    }
}
