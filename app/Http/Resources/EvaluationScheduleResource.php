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
            'evaluation_type' => EvaluationTypeResource::make($this->evaluationType),
            'evaluation_form' => EvaluationFormResource::make($this->evaluationForm),
            'evaluation_schedule_subject_classes_open_count' => $this->whenNotNull(
                $this->evaluation_schedule_subject_classes_open_count,
                $this->evaluation_schedule_subject_classes_open_count
            ),
            'evaluation_schedule_subject_classes_closed_count' => $this->whenNotNull(
                $this->evaluation_schedule_subject_classes_closed_count,
                $this->evaluation_schedule_subject_classes_closed_count
            ),
            'evaluation_schedule_subject_classes_count' => $this->whenNotNull(
                $this->evaluation_schedule_subject_classes_count,
                $this->evaluation_schedule_subject_classes_count
            ),
            'subject_classes_open_count' => $this->whenNotNull(
                $this->subject_classes_open_count,
                $this->subject_classes_open_count
            ),
            'subject_classes_closed_count' => $this->whenNotNull(
                $this->subject_classes_closed_count,
                $this->subject_classes_closed_count
            ),
            'subject_classes_count' => $this->whenNotNull(
                $this->subject_classes_count,
                $this->subject_classes_count
            ),

            'evaluatees_open_count' => $this->when(
                $this->evaluationType->code !== 'student-to-teacher-evaluation',
                $this->evaluatees_open_count ?? 0
            ),
            'evaluatees_closed_count' => $this->when(
                $this->evaluationType->code !== 'student-to-teacher-evaluation',
                $this->evaluatees_closed_count ?? 0
            ),
            'evaluatees_count' => $this->when(
                $this->evaluationType->code !== 'student-to-teacher-evaluation',
                $this->evaluatees_count ?? 0
            ),
        ];
    }
}
