<?php

namespace Database\Seeders;

use App\Models\Criterion;
use App\Models\EvaluationForm;
use App\Models\Indicator;
use App\Models\LikertScale;
use Illuminate\Database\Seeder;

class EvaluationFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $evaluationFormModel = new EvaluationForm;
        $criterionModel = new Criterion;
        $indicatorModel = new Indicator;

        $jsonString = file_get_contents(base_path('database/seeders/json/evaluation_forms.json'));
        $data = json_decode($jsonString, true);
        $evaluationFormSeeds = $data['evaluation_forms'];

        foreach ($evaluationFormSeeds as $evaluationFormSeed) {
            $evaluationForm = $evaluationFormModel->newQuery()
                ->firstOrCreate(
                    [
                        'title' => $evaluationFormSeed['title'],
                    ],
                    [
                        'description' => $evaluationFormSeed['description'],
                        'likert_scale_id' => LikertScale::where('code', $evaluationFormSeed['likert_scale_code'])->first()->id,
                        'published' => true,
                    ]
                );

            $evaluationFormCriterionSeeds = $evaluationFormSeed['criteria'];
            foreach ($evaluationFormCriterionSeeds as $criterionSeed) {
                $criterion = $criterionModel->newQuery()
                    ->firstOrCreate(
                        [
                            'evaluation_form_id' => $evaluationForm->id,
                            'description' => $criterionSeed['description'],
                        ],
                        [
                            'is_weighted' => $criterionSeed['is_weighted'] ?? true,
                            'weight' => $criterionSeed['weight'] ?? 0,
                        ]
                    );

                $criterionIndicatorSeeds = $criterionSeed['indicators'];
                foreach ($criterionIndicatorSeeds as $indicatorSeed) {
                    $indicatorModel->newQuery()
                        ->firstOrCreate(
                            [
                                'criterion_id' => $criterion->id,
                                'description' => $indicatorSeed['description'],
                            ]
                        );
                }
            }
        }
    }
}
