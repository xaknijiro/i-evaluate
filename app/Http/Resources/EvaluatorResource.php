<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluatorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'evaluatee_id' => $this->evaluatee_id,
            'user' => UserResource::make($this->user),
            'submitted' => (bool) $this->submitted,
            'evaluation_schedule' => $this->when(
                in_array('evaluation_schedule', $request->input('with', [])),
                EvaluationScheduleResource::make($this->evaluatee->evaluationSchedule)
            ),
            'evaluatee' => $this->when(
                in_array('evaluatee', $request->input('with', [])),
                [
                    'id' => $this->evaluatee->id,
                    'institution_id' => $this->evaluatee->user->institution_id,
                    'first_name' => $this->evaluatee->user->first_name,
                    'last_name' => $this->evaluatee->user->last_name,
                ]
            ),
        ];
    }
}
