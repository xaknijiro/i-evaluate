<?php

namespace App\Services;

use App\Models\Criterion;
use App\Models\EvaluationResponse;
use App\Models\EvaluationScheduleSubjectClass;
use App\Models\Indicator;
use App\Repositories\EvaluationResultRepository;
use Illuminate\Support\Collection;

class EvaluationResultService
{
    public function __construct(
        protected EvaluationResponse $evaluationResponse,
        protected EvaluationResultRepository $evaluationResultRepository,
    ) {
    }

    public function calculate(EvaluationScheduleSubjectClass $evaluationScheduleSubjectClass)
    {
        $evaluationForm = $evaluationScheduleSubjectClass->evaluationSchedule->evaluationForm;
        $evaluationForm->loadMissing(['criteria.indicators', 'likertScale']);
        $indicatorMaxScore = $evaluationForm->likertScale->max_score;

        $indicatorIds = $evaluationForm->criteria->pluck('indicators')->flatten()->pluck('id')->toArray();

        $responsesGroupByIndicator = $this->evaluationResponse->newQuery()
            ->where('evaluation_schedule_subject_class_id', $evaluationScheduleSubjectClass->id)
            ->whereIn('indicator_id', $indicatorIds)
            ->get()
            ->groupBy('indicator_id');

        $responsesByIndicatorAveScore = $responsesGroupByIndicator->mapWithKeys(function (Collection $responses, $indicatorId) {
            return [
                $indicatorId => collect([
                    'ave_score' => $responses->average('value'),
                    'respondents' => $responses->count(),
                ]),
            ];
        });

        $criteriaResult = $evaluationForm->criteria->mapWithKeys(function (Criterion $criterion) use ($responsesByIndicatorAveScore, $indicatorMaxScore) {
            $indicatorsResult = $criterion->indicators->mapWithKeys(function (Indicator $indicator) use ($responsesByIndicatorAveScore, $indicatorMaxScore) {
                return [
                    $indicator->id => $responsesByIndicatorAveScore->get($indicator->id) ?? collect([
                        'ave_score' => 0,
                        'respondents' => 0,
                    ]),
                ];
            });

            $totalScore = round($indicatorsResult->sum('ave_score'), 2);
            $totalMaxScore = $indicatorsResult->count() * $indicatorMaxScore;
            $percentage = round($totalScore / $totalMaxScore * 100, 2);
            $weigthedScore = round($percentage * $criterion->weight, 2);

            return [
                $criterion->id => collect([
                    'indicators' => $indicatorsResult,
                    'total_score' => $totalScore,
                    'total_max_score' => $totalMaxScore,
                    'percentage' => $percentage,
                    'weighted_score' => $weigthedScore,
                ]),
            ];
        });

        $calculationResult = [
            'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
            'details' => json_encode([
                'criteria' => $criteriaResult,
                'overall_score' => round($criteriaResult->sum('weighted_score'), 2),
            ])
        ];

        $this->evaluationResultRepository->saveCalculationResult([
            $calculationResult,
        ]);

        $evaluationScheduleSubjectClass->is_open = false;
        $evaluationScheduleSubjectClass->save();

        return $evaluationScheduleSubjectClass->evaluationResult;
    }
}
