<?php

namespace App\Http\Resources;

use App\Services\EvaluationResultService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluateeOverallEvaluationResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $evaluationResultService = resolve(EvaluationResultService::class);

        $evaluationResults = $this->evaluatees->map(function ($evaluatee) {
            $evaluationResult = ! $evaluatee->is_open ? $evaluatee->evaluationResult : null;
            $weight = 0.25;

            return [
                'evaluation_type' => $evaluatee->evaluationSchedule->evaluationType,
                'evaluation_result' => $evaluationResult,
                'weight' => $weight,
                'weighted_rating' => $evaluationResult ? $evaluationResult->details['overall_rating'] * $weight : null,
            ];
        });

        $evaluationScheduleSubjectClasses = $this->subjectClasses->pluck('evaluationScheduleSubjectClass');
        if ($evaluationScheduleSubjectClasses->isNotEmpty()) {
            $studentToTeacherEvaluation = $evaluationScheduleSubjectClasses->first()->evaluationSchedule->evaluationType;

            $doCalculateWeightedRating = $evaluationScheduleSubjectClasses->count() === $evaluationScheduleSubjectClasses
                ->filter(fn ($evaluationScheduleSubjectClass) => ! $evaluationScheduleSubjectClass->is_open && $evaluationScheduleSubjectClass->evaluationResult)
                ->count();

            if ($doCalculateWeightedRating) {
                $subjectClassesEvaluationResultPerCriterion = $evaluationScheduleSubjectClasses->pluck('evaluationResult.details.criteria');
                $evaluationResultSummaryPerCriterion = collect();
                $subjectClassesEvaluationResultPerCriterion->each(function ($item) use (&$evaluationResultSummaryPerCriterion) {
                    $evaluationResultSummaryPerCriterion = $evaluationResultSummaryPerCriterion->merge($item);
                });
                $evaluationResultSummaryPerCriterion = $evaluationResultSummaryPerCriterion
                    ->groupBy('id')
                    ->mapWithKeys(function ($criterion) {
                        $aveRating = round($criterion->average('rating'), 2);
                        $weight = $criterion->first()['weight'];
                        $weightedRating = round($aveRating * $weight, 2);

                        return [$criterion->first()['id'] => [
                            'id' => $criterion->first()['id'],
                            'ave_rating' => $aveRating,
                            'weight' => $weight,
                            'weighted_rating' => $weightedRating,
                        ]];
                    });

                $evaluationResultSummaryOverallRating = round($evaluationResultSummaryPerCriterion->sum('weighted_rating'), 2);
                [$evaluationResultSummaryOverallRatingDescriptiveEquivalent, $evaluationResultSummaryOverallRatingPercentileEquivalent] = $evaluationResultService->getDescriptiveEquivalentAndPercentileEquivalent(
                    $evaluationScheduleSubjectClasses->first()->evaluationSchedule->evaluationForm,
                    $evaluationResultSummaryOverallRating
                );

                $evaluationResultSummary = [
                    'criteria' => $evaluationResultSummaryPerCriterion,
                    'overall_rating' => $evaluationResultSummaryOverallRating,
                    'descriptive_equivalent' => $evaluationResultSummaryOverallRatingDescriptiveEquivalent,
                    'percentile_equivalent' => $evaluationResultSummaryOverallRatingPercentileEquivalent,
                ];

                $weight = 0.25;
                $weightedRating = round($evaluationResultSummaryOverallRating * $weight, 2);
            } else {
                $evaluationResultSummary = [];
                $weight = 0.25;
                $weightedRating = null;
            }

            $evaluationResults->push([
                'evaluation_type' => $studentToTeacherEvaluation,
                'evaluation_subject_classes' => $evaluationScheduleSubjectClasses,
                'evaluation_result_summary' => $evaluationResultSummary,
                'weight' => $weight,
                'weighted_rating' => $weightedRating,
            ]);
        }

        return [
            'id' => $this->id,
            'institution_id' => $this->institution_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'email' => $this->email,
            'department' => $this->when($this->departments->first(), DepartmentResource::make($this->departments->first())),
            'evaluation_results' => $evaluationResults,
            'overall_weighted_rating' => $evaluationResults->filter(fn ($evaluationResult) => ! is_null($evaluationResult['weighted_rating']))->count() === 4
                ? round($evaluationResults->sum('weighted_rating'), 2) : null,
        ];
    }
}
