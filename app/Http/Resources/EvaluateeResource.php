<?php

namespace App\Http\Resources;

use App\Services\EvaluationResultService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluateeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $evaluationResultService = resolve(EvaluationResultService::class);

        $evaluationSchedule = $request->evaluationSchedule;
        $evaluationType = $evaluationSchedule->evaluationType;

        $evaluatee = null;
        $evaluationResultSummary = null;

        if ($evaluationType->code === 'student-to-teacher-evaluation') {
            $subjectClassesEvaluated = $this->subjectClasses->filter(fn ($subjectClass) => $subjectClass->evaluationScheduleSubjectClass &&
                ! $subjectClass->evaluationScheduleSubjectClass->is_open);

            $subjectClassesEvaluationResultPerCriterion = $subjectClassesEvaluated
                ->pluck('evaluationScheduleSubjectClass.evaluationResult.details.criteria');
            $evaluationResultSummaryPerCriterion = collect();
            $subjectClassesEvaluationResultPerCriterion->each(function ($item) use (&$evaluationResultSummaryPerCriterion) {
                $evaluationResultSummaryPerCriterion = $evaluationResultSummaryPerCriterion->merge($item);
            });
            $evaluationResultSummaryPerCriterion = $evaluationResultSummaryPerCriterion
                ->groupBy('id')
                ->mapWithKeys(function ($criterion) {
                    $aveRating = $criterion->average('rating');
                    $weight = $criterion->first()['weight'];
                    $weightedRating = $aveRating * $weight;

                    return [$criterion->first()['id'] => [
                        'id' => $criterion->first()['id'],
                        'ave_rating' => $aveRating,
                        'weight' => $weight,
                        'weighted_rating' => $weightedRating,
                    ]];
                });
            $evaluationResultSummaryOverallRating = null;
            $evaluationResultSummaryOverallRatingDescriptiveEquivalent = null;
            $evaluationResultSummaryOverallRatingPercentileEquivalent = null;

            if ($subjectClassesEvaluated->isNotEmpty()) {
                $evaluationResultSummaryOverallRating = round($evaluationResultSummaryPerCriterion->sum('weighted_rating'), 2);
                [$evaluationResultSummaryOverallRatingDescriptiveEquivalent, $evaluationResultSummaryOverallRatingPercentileEquivalent] = $evaluationResultService->getDescriptiveEquivalentAndPercentileEquivalent(
                    $subjectClassesEvaluated->first()->evaluationSchedule->evaluationForm,
                    $evaluationResultSummaryOverallRating
                );

                $evaluationResultSummary = [
                    'criteria' => $evaluationResultSummaryPerCriterion,
                    'overall_rating' => $evaluationResultSummaryOverallRating,
                    'descriptive_equivalent' => $evaluationResultSummaryOverallRatingDescriptiveEquivalent,
                    'percentile_equivalent' => $evaluationResultSummaryOverallRatingPercentileEquivalent,
                ];
            }
        }
        $evaluatee = $this->evaluatees->where('evaluation_schedule_id', $evaluationSchedule->id)->first();

        $commonFields = [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'department' => $this->when($this->departments->first(), DepartmentResource::make($this->departments->first())),
        ];

        if ($evaluationType->code === 'student-to-teacher-evaluation') {
            $otherFields = [
                'subject_classes_count' => $this->when(
                    $evaluationType->code === 'student-to-teacher-evaluation',
                    $this->subject_classes_count
                ),
                'subject_classes_count_open' => $this->when(
                    $evaluationType->code === 'student-to-teacher-evaluation',
                    $this->subject_classes_count_open
                ),
                'subject_classes_count_closed' => $this->when(
                    $evaluationType->code === 'student-to-teacher-evaluation',
                    $this->subject_classes_count_closed
                ),
                'subject_classes' => $this->when(
                    $evaluationType->code === 'student-to-teacher-evaluation',
                    EvaluateeSubjectClassResource::collection($this->subjectClasses)
                ),
            ];
        } else {
            $otherFields = [
                'evaluation' => [
                    'id' => $evaluatee->id,
                    'is_open' => (bool) $evaluatee->is_open,
                    'evaluators' => EvaluatorResource::collection($evaluatee->evaluators),
                    'evaluators_count' => $evaluatee->evaluators_count,
                    'evaluators_count_submitted' => $evaluatee->evaluators_submitted_count,
                    'result' => $this->when(
                        ! $evaluatee->is_open && $evaluatee->evaluationResult,
                        [
                            'id' => $evaluatee->evaluationResult?->id,
                            'evaluatee_id' => $evaluatee->evaluationResult?->evaluatee_id,
                            'details' => $evaluatee->evaluationResult?->details,
                            'remarks' => $evaluatee->evaluationResult?->remarks,
                            'is_released' => $evaluatee->evaluationResult?->is_released,
                        ]
                    ),
                ],
            ];
        }

        return [
            ...$commonFields,
            ...$otherFields,
            ...[
                'evaluation_result_summary' => $evaluationResultSummary,
            ],
        ];
    }
}
