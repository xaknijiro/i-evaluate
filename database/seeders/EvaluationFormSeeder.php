<?php

namespace Database\Seeders;

use App\Models\Criterion;
use App\Models\EvaluationForm;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EvaluationFormSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EvaluationForm::factory(50)
            ->has(Criterion::factory(4, [
                'weight' => 0.25,
            ])->hasIndicators(5))
            ->create();
    }
}
