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
                        'scale_range' => [0, 2.6],
                        'percentile_range' => [
                            [
                                [0, 2],
                                70,
                            ],
                            [
                                [2.01, 2.12],
                                75,
                            ],
                            [
                                [2.13, 2.24],
                                76,
                            ],
                            [
                                [2.25, 2.36],
                                77,
                            ],
                            [
                                [2.37, 2.48],
                                78,
                            ],
                            [
                                [2.49, 2.60],
                                79,
                            ],
                        ],
                    ],
                    [
                        'value' => 2,
                        'label' => 'Fair',
                        'scale_range' => [2.61, 3.2],
                        'percentile_range' => [
                            [
                                [2.61, 2.72],
                                80,
                            ],
                            [
                                [2.73, 2.84],
                                81,
                            ],
                            [
                                [2.85, 2.96],
                                82,
                            ],
                            [
                                [2.97, 3.08],
                                83,
                            ],
                            [
                                [3.09, 3.20],
                                84,
                            ],
                        ],
                    ],
                    [
                        'value' => 3,
                        'label' => 'Satisfactory',
                        'scale_range' => [3.21, 3.8],
                        'percentile_range' => [
                            [
                                [3.21, 3.32],
                                85,
                            ],
                            [
                                [3.33, 3.44],
                                86,
                            ],
                            [
                                [3.45, 3.56],
                                87,
                            ],
                            [
                                [3.57, 3.68],
                                88,
                            ],
                            [
                                [3.69, 3.80],
                                89,
                            ],
                        ],
                    ],
                    [
                        'value' => 4,
                        'label' => 'Very Satisfactory',
                        'scale_range' => [3.81, 4.4],
                        'percentile_range' => [
                            [
                                [3.81, 3.92],
                                90,
                            ],
                            [
                                [3.93, 4.04],
                                91,
                            ],
                            [
                                [4.05, 4.16],
                                92,
                            ],
                            [
                                [4.17, 4.28],
                                93,
                            ],
                            [
                                [4.29, 4.40],
                                94,
                            ],
                        ],
                    ],
                    [
                        'value' => 5,
                        'label' => 'Excellent',
                        'scale_range' => [4.41, 5],
                        'percentile_range' => [
                            [
                                [4.41, 4.52],
                                95,
                            ],
                            [
                                [4.53, 4.64],
                                96,
                            ],
                            [
                                [4.65, 4.76],
                                97,
                            ],
                            [
                                [4.77, 4.88],
                                98,
                            ],
                            [
                                [4.89, 5],
                                99,
                            ],
                        ],
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
