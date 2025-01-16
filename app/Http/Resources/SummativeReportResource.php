<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SummativeReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => "$this->academic_year-$this->semester_id",
            'academic_year' => $this->academic_year,
            'semester_id' => $this->semester_id,
            'semester' => $this->semester_title,
            'evaluation_schedules' => EvaluationScheduleResource::collection($this->evaluation_types->pluck('evaluation_schedule')->filter()),
        ];
    }
}
