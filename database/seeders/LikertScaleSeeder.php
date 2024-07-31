<?php

namespace Database\Seeders;

use App\Models\LikertScale;
use Illuminate\Database\Seeder;

class LikertScaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $likertScales = [
            [
                'title' => '5 Point Scale',
                'code' => '5-point-scale',
                'max_score' => 5,
                'default_options' => [
                    [
                        'value' => 1,
                        'label' => 'Needs Improvement',
                    ],
                    [
                        'value' => 2,
                        'label' => 'Fair',
                    ],
                    [
                        'value' => 3,
                        'label' => 'Satisfactory',
                    ],
                    [
                        'value' => 4,
                        'label' => 'Very Satisfactory',
                    ],
                    [
                        'value' => 5,
                        'label' => 'Excellent',
                    ],
                ],
            ],
        ];

        $likertScaleModel = new LikertScale;
        foreach ($likertScales as $likertScale) {
            $likertScaleModel->newQuery()
                ->firstOrCreate(
                    [
                        'code' => $likertScale['code'],
                    ],
                    [
                        'title' => $likertScale['title'],
                        'max_score' => $likertScale['max_score'],
                        'default_options' => $likertScale['default_options'],
                    ]
                );
        }
    }
}
