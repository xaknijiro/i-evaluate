<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluateeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'subject_classes_count' => $this->subject_classes_count,
            'subject_classes_count_open' => $this->subject_classes_count_open,
            'subject_classes_count_closed' => $this->subject_classes_count_closed,
            'subject_classes' => EvaluateeSubjectClassResource::collection($this->subjectClasses),
        ];
    }
}
