<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\EvaluationForm;
use App\Models\EvaluationPasscode;
use App\Models\EvaluationSchedule;
use App\Models\EvaluationScheduleSubjectClass;
use App\Models\EvaluationType;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Models\User;
use Faker\Generator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EvaluationScheduleFakeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(EvaluationSchedule $evaluationSchedule, Generator $faker): void
    {
        $evaluationSchedules = EvaluationSchedule::factory()->count(5)->create([
            'evaluation_type_id' => EvaluationType::where('code', 'student-to-teacher-evaluation')->first()->id,
            'evaluation_form_id' => EvaluationForm::find(2)->id,
        ]);

        $evaluationSchedules
            ->whereInstanceOf(EvaluationSchedule::class)
            ->each(function (EvaluationSchedule $evaluationSchedule) use ($faker) {
                $subjectClasses = SubjectClass::factory()
                    ->count($faker->numberBetween(10, 30))
                    ->sequence(fn () => [
                        'subject_id' => Subject::all()->random()->id,
                        'course_id' => Course::all()->random()->id,
                        'year_level' => random_int(1, 4),
                        'assigned_to' => User::factory()->create()->id,
                    ])
                    ->create([
                        'academic_year' => $evaluationSchedule->academic_year,
                        'semester_id' => $evaluationSchedule->semester_id,
                    ]);

                $subjectClasses
                    ->whereInstanceOf(SubjectClass::class)
                    ->each(function (SubjectClass $subjectClass) use ($evaluationSchedule) {
                        EvaluationScheduleSubjectClass::factory()
                            ->create([
                                'code' => $evaluationSchedule->id.$subjectClass->id.Str::random(6),
                                'evaluation_schedule_id' => $evaluationSchedule->id,
                                'subject_class_id' => $subjectClass->id,
                            ]);
                    });
            });

        // EvaluationPasscode::factory()
        //     ->count(10)
        //     ->sequence(fn () => [
        //         'email' => $faker->email,
        //         'code' => $evaluationSchedule->id . "-" . Str::random(6),
        //     ])
        //     ->create([
        //         'evaluation_schedule_subject_class_id' => $evaluationScheduleSubject->id,
        //         'expires_at' => now()->addMinutes(30),
        //     ]);
    }
}
