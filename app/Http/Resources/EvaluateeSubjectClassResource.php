<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluateeSubjectClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => SubjectResource::make($this->subject),
            'course' => CourseResource::make($this->course),
            'year_level' => $this->year_level,
            'evaluation' => EvaluationResource::make($this->evaluationScheduleSubjectClass),
        ];
    }
}
