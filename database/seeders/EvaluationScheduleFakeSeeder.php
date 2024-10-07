<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\EvaluationForm;
use App\Models\EvaluationPasscode;
use App\Models\EvaluationResponse;
use App\Models\EvaluationSchedule;
use App\Models\EvaluationScheduleSubjectClass;
use App\Models\EvaluationType;
use App\Models\Indicator;
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
    public function run(Generator $faker): void
    {
        EvaluationSchedule::where('id', '>', 1)->delete();
        SubjectClass::where('id', '>', 1)->delete();

        $evaluationSchedules = EvaluationSchedule::factory()->count(1)->create([
            'evaluation_type_id' => EvaluationType::where('code', 'student-to-teacher-evaluation')->first()->id,
            'evaluation_form_id' => EvaluationForm::find(2)->id,
        ]);

        $evaluationSchedules
            ->whereInstanceOf(EvaluationSchedule::class)
            ->each(function (EvaluationSchedule $evaluationSchedule) use ($faker) {
                $subjectClasses = SubjectClass::factory()
                    ->count(100)
                    ->sequence(fn ($sequence) => [
                        'section' => Str::random(8).'-'.$sequence->index,
                        'subject_id' => Subject::all()->random()->id,
                        'course_id' => Course::all()->random()->id,
                        'year_level' => random_int(1, 4),
                        'assigned_to' => User::all()->random()->id,
                        'schedule' => $faker->sentence,
                    ])
                    ->create([
                        'academic_year' => $evaluationSchedule->academic_year,
                        'semester_id' => $evaluationSchedule->semester_id,
                    ]);

                $subjectClasses
                    ->whereInstanceOf(SubjectClass::class)
                    ->each(function (SubjectClass $subjectClass) use ($evaluationSchedule, $faker) {
                        $evaluationSubjectClass = EvaluationScheduleSubjectClass::factory()
                            ->create([
                                'code' => $evaluationSchedule->id.'-'.$subjectClass->id.'-'.Str::random(8),
                                'evaluation_schedule_id' => $evaluationSchedule->id,
                                'subject_class_id' => $subjectClass->id,
                            ]);

                        $evaluations = EvaluationPasscode::factory()
                            ->count(10)
                            ->sequence(fn ($sequence) => [
                                'email' => $faker->email.$sequence->index,
                                'code' => $evaluationSchedule->id.'-'.$subjectClass->id.'-'.Str::random(8),
                                'institution_id' => $faker->uuid,
                            ])
                            ->create([
                                'evaluation_schedule_subject_class_id' => $evaluationSubjectClass->id,
                                'expires_at' => now()->addMinutes(30),
                            ]);

                        $evaluations->each(function (EvaluationPasscode $evaluationPasscode) use ($faker) {
                            $evaluationScheduleSubjectClass = $evaluationPasscode->evaluationScheduleSubjectClass;
                            $evaluationSchedule = $evaluationScheduleSubjectClass->evaluationSchedule;
                            $evaluationForm = $evaluationSchedule->evaluationForm;
                            $indicators = $evaluationForm->criteria->pluck('indicators')->flatten();
                            $indicators->each(function (Indicator $indicator) use ($evaluationScheduleSubjectClass, $faker) {
                                EvaluationResponse::factory()->create([
                                    'evaluation_schedule_subject_class_id' => $evaluationScheduleSubjectClass->id,
                                    'indicator_id' => $indicator->id,
                                    'value' => $faker->boolean ? random_int(3, 5) : random_int(1, 2),
                                ]);
                            });
                            $evaluationPasscode->update(['submitted' => true]);
                        });
                    });
            });
    }
}
