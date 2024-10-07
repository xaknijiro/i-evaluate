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
        }

        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'department' => $this->when($this->departments->first(), DepartmentResource::make($this->departments->first())),
            'subject_classes_count' => $this->subject_classes_count,
            'subject_classes_count_open' => $this->subject_classes_count_open,
            'subject_classes_count_closed' => $this->subject_classes_count_closed,
            'subject_classes' => EvaluateeSubjectClassResource::collection($this->subjectClasses),
            'evaluation_result_summary' => $subjectClassesEvaluated->isNotEmpty()
                ? [
                    'criteria' => $evaluationResultSummaryPerCriterion,
                    'overall_rating' => $evaluationResultSummaryOverallRating,
                    'descriptive_equivalent' => $evaluationResultSummaryOverallRatingDescriptiveEquivalent,
                    'percentile_equivalent' => $evaluationResultSummaryOverallRatingPercentileEquivalent,
                ]
                : null,
        ];
    }
}
