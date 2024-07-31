<?php

namespace Database\Seeders;

use App\Models\EvaluationType;
use Illuminate\Database\Seeder;

class EvaluationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $evaluationTypes = [
            [
                'title' => 'Peer Evaluation',
                'code' => 'peer-evaluation',
            ],
            [
                'title' => 'Student to Teacher Evaluation',
                'code' => 'student-to-teacher-evaluation',
            ],
            [
                'title' => 'Dean to Teacher Evaluation',
                'code' => 'dean-to-teacher-evaluation',
            ],
            [
                'title' => 'Self Evaluation',
                'code' => 'self-evaluation',
            ],
        ];

        $evaluationTypeModel = new EvaluationType;
        foreach ($evaluationTypes as $type) {
            $evaluationTypeModel->newQuery()
                ->firstOrCreate(
                    [
                        'code' => $type['code'],
                    ],
                    [
                        'title' => $type['title'],
                    ]
                );
        }
    }
}
