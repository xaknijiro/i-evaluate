<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationScheduleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'academic_year' => $this->academic_year,
            'semester' => $this->semester->title,
            'is_open' => $this->is_open,
        ];
    }
}
