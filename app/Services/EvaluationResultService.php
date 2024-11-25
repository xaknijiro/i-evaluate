<?php

namespace App\Services;

use App\Models\Criterion;
use App\Models\Evaluatee;
use App\Models\EvaluationForm;
use App\Models\EvaluationResponse;
use App\Models\EvaluationScheduleSubjectClass;
use App\Models\Indicator;
use App\Models\Response;
use App\Repositories\EvaluationResultRepository;
use App\Repositories\ResultRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EvaluationResultService
{
    public function __construct(
        protected Response $response,
        protected EvaluationResponse $evaluationResponse,
        protected EvaluationResultRepository $evaluationResultRepository,
        protected ResultRepository $resultRepository,
    ) {}

    public function calculate(EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass)
    {
        $evaluationForm = $evaluationScheduleSubjectClass->evaluationSchedule->evaluationForm;
        $evaluationForm->loadMissing(['criteria.indicators', 'likertScale']);
        $criteria = $evaluationForm->criteria;

        $indicatorIds = $criteria->pluck('indicators')->flatten()->pluck('id')->toArray();

        $responsesGroupByIndicator = $this->evaluationResponse->newQuery()
            ->where('evaluation_schedule_subject_class_id', $evaluationScheduleSubjectClass->id)
            ->whereIn('indicator_id', $indicatorIds)
            ->get()
            ->groupBy('indicator_id');

        $responsesByIndicatorAveScore = $responsesGroupByIndicator->mapWithKeys(function (Collection $responses, $indicatorId) {
            $indicatorCalculation = [
                'id' => $indicatorId,
                'tally' => $responses->groupBy('value')->values()->map(function ($group) {
                    $rating = $group->first()->value;
                    $count = $group->count();

                    return [
                        'value' => $rating,
                        'count' => $count,
                        'points' => $rating * $count,
                        'comments' => $group->pluck('comments')->join(PHP_EOL),
                    ];
                }),
            ];
            $tally = collect($indicatorCalculation['tally']);
            $totalPoints = $tally->sum('points');
            $responses = $tally->sum('count');
            $indicatorRating = round($totalPoints / $responses, 2);
            $indicatorCalculation['total_points'] = $totalPoints;
            $indicatorCalculation['responses'] = $responses;
            $indicatorCalculation['rating'] = $indicatorRating;

            return [
                $indicatorId => collect($indicatorCalculation),
            ];
        });

        $criteriaResult = $criteria->mapWithKeys(function (Criterion $criterion) use ($responsesByIndicatorAveScore) {
            $indicatorsResult = $criterion->indicators->mapWithKeys(function (Indicator $indicator) use ($responsesByIndicatorAveScore) {
                return [
                    $indicator->id => $responsesByIndicatorAveScore->get($indicator->id) ?? collect(),
                ];
            });

            $totalPoints = $indicatorsResult->sum('total_points');
            $responses = $indicatorsResult->sum('responses');
            $criterionRating = round($totalPoints / $responses, 2);
            $weigthedRating = round($criterionRating * $criterion->weight, 2);

            return [
                $criterion->id => collect([
                    'id' => $criterion->id,
                    'is_weighted' => $criterion->is_weighted,
                    'weight' => $criterion->weight,
                    'indicators' => $indicatorsResult,
                    'total_points' => $totalPoints,
                    'responses' => $responses,
                    'rating' => $criterionRating,
                    'weighted_rating' => $weigthedRating,
                ]),
            ];
        });

        $overallRating = round($criteriaResult->sum('weighted_rating'), 2);
        [$descriptiveEquivalent, $percentileEquivalent] = $this->getDescriptiveEquivalentAndPercentileEquivalent($evaluationForm, $overallRating);

        $calculationResult = [
            'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
            'details' => json_encode([
                'criteria' => $criteriaResult,
                'overall_rating' => $overallRating,
                'descriptive_equivalent' => $descriptiveEquivalent,
                'percentile_equivalent' => $percentileEquivalent,
            ]),
        ];

        $this->evaluationResultRepository->saveCalculationResult([
            $calculationResult,
        ]);

        $evaluationScheduleSubjectClass->is_open = false;
        $evaluationScheduleSubjectClass->save();

        return $evaluationScheduleSubjectClass->evaluationResult;
    }

    public function calculateByEvaluatee(Evaluatee $evaluatee)
    {
        $evaluationForm = $evaluatee->evaluationSchedule->evaluationForm;
        $evaluationForm->loadMissing(['criteria.indicators', 'likertScale']);
        $criteria = $evaluationForm->criteria;

        $indicatorIds = $criteria->pluck('indicators')->flatten()->pluck('id')->toArray();

        $responsesGroupByIndicator = $this->response->newQuery()
            ->where('evaluatee_id', $evaluatee->id)
            ->whereIn('indicator_id', $indicatorIds)
            ->get()
            ->groupBy('indicator_id');

        $responsesByIndicatorAveScore = $responsesGroupByIndicator->mapWithKeys(function (Collection $responses, $indicatorId) {
            $indicatorCalculation = [
                'id' => $indicatorId,
                'tally' => $responses->groupBy('value')->values()->map(function ($group) {
                    $rating = $group->first()->value;
                    $count = $group->count();

                    return [
                        'value' => $rating,
                        'count' => $count,
                        'points' => $rating * $count,
                        'comments' => $group->pluck('comments')->join(PHP_EOL),
                    ];
                }),
            ];
            $tally = collect($indicatorCalculation['tally']);
            $totalPoints = $tally->sum('points');
            $responses = $tally->sum('count');
            $indicatorRating = round($totalPoints / $responses, 2);
            $indicatorCalculation['total_points'] = $totalPoints;
            $indicatorCalculation['responses'] = $responses;
            $indicatorCalculation['rating'] = $indicatorRating;

            return [
                $indicatorId => collect($indicatorCalculation),
            ];
        });

        $criteriaResult = $criteria->mapWithKeys(function (Criterion $criterion) use ($responsesByIndicatorAveScore) {
            $indicatorsResult = $criterion->indicators->mapWithKeys(function (Indicator $indicator) use ($responsesByIndicatorAveScore) {
                return [
                    $indicator->id => $responsesByIndicatorAveScore->get($indicator->id) ?? collect(),
                ];
            });

            $totalPoints = $indicatorsResult->sum('total_points');
            $responses = $indicatorsResult->sum('responses');
            $criterionRating = round($totalPoints / $responses, 2);
            $weigthedRating = round($criterionRating * $criterion->weight, 2);

            return [
                $criterion->id => collect([
                    'id' => $criterion->id,
                    'is_weighted' => $criterion->is_weighted,
                    'weight' => $criterion->weight,
                    'indicators' => $indicatorsResult,
                    'total_points' => $totalPoints,
                    'responses' => $responses,
                    'rating' => $criterionRating,
                    'weighted_rating' => $weigthedRating,
                ]),
            ];
        });

        $overallRating = round($criteriaResult->sum('weighted_rating'), 2);
        [$descriptiveEquivalent, $percentileEquivalent] = $this->getDescriptiveEquivalentAndPercentileEquivalent($evaluationForm, $overallRating);

        $calculationResult = [
            'evaluatee_id' => $evaluatee->id,
            'details' => json_encode([
                'criteria' => $criteriaResult,
                'overall_rating' => $overallRating,
                'descriptive_equivalent' => $descriptiveEquivalent,
                'percentile_equivalent' => $percentileEquivalent,
            ]),
        ];

        DB::transaction(function () use ($calculationResult, $evaluatee) {
            $this->resultRepository->saveCalculationResult([
                $calculationResult,
            ]);

            $evaluatee->is_open = false;
            $evaluatee->save();
        });

        return $evaluatee->evaluationResult;
    }

    public function getDescriptiveEquivalentAndPercentileEquivalent(EvaluationForm $evaluationForm, float $rating): array
    {
        $options = collect($evaluationForm->likertScale->default_options)->sortByDesc('value');
        $descriptiveEquivalent = $options->filter(fn ($option) => $rating >= $option['scale_range'][0]
            && $rating <= $option['scale_range'][1])?->first()['label'] ?? null;
        $percentileRange = $options->filter(fn ($option) => $rating >= $option['scale_range'][0]
            && $rating <= $option['scale_range'][1])?->first()['percentile_range'] ?? null;
        $percentileEquivalent = $percentileRange
            ? collect($percentileRange)->filter(fn ($p) => $rating >= $p[0][0] && $rating <= $p[0][1])?->first()[1] ?? null
            : null;

        return [
            $descriptiveEquivalent,
            $percentileEquivalent,
        ];
    }
}
