<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EvaluationSchedule>
 */
class EvaluationScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $randomYear = $this->faker->date('Y');
        $academicYear = $randomYear.'-'.($randomYear + 1);

        return [
            'academic_year' => $academicYear,
            'semester_id' => $this->faker->randomElement([1, 2]),
        ];
    }
}
