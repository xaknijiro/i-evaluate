<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Criterion;
use App\Models\Department;
use App\Models\EvaluationForm;
use App\Models\EvaluationType;
use App\Models\Indicator;
use App\Models\LikertScale;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FakeSeeder extends Seeder
{
    public function __construct(
        private Course $course,
        private Criterion $criterion,
        private Department $department,
        private EvaluationForm $evaluationForm,
        private Indicator $indicator,
        private Subject $subject,
        private User $user
    ) {
        
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->user->newQuery()->where('email', '<>', 'dave.medrano@example.com')->delete();
        $this->command->info('Cleared users!');

        $this->evaluationForm->newQuery()->delete();
        $this->criterion->newQuery()->delete();
        $this->indicator->newQuery()->delete();
        $this->command->info('Cleared evaluation forms!');

        $this->department->newQuery()->delete();
        $this->course->newQuery()->delete();
        $this->subject->newQuery()->delete();
        $this->command->info('Cleared departments, courses, and subjects!');


        // Default User
        $defaultUser = $this->user->newQuery()
            ->firstOrCreate(
                [
                    'email' => 'dave.medrano@example.com',
                ],
                [
                    'institution_id' => '456123',
                    'first_name' => 'Dave',
                    'last_name' => 'Medrano',
                    'gender' => 'Male',
                    'password' => Hash::make('123456'),
                ]
            );
        $defaultUser->assignRole('Evaluation Manager');

        $this->command->line('Create fake evaluation forms...');
        $evaluationTypes = EvaluationType::all();
        $this->evaluationForm
            ->factory($evaluationTypes->count())
            ->sequence(fn (Sequence $sequence) => [
                'title' => $evaluationTypes[$sequence->index]->title . ' v1',
            ])
            ->has(
                $this->criterion->factory(5)->sequence(fn (Sequence $sequence) => [
                    'description' => 'Criterion ' . $sequence->index % 5 + 1,
                    'is_weighted' => ($sequence->index + 1) % 5 !== 0,
                    'weight' => ($sequence->index + 1) % 5 !== 0 ? 0.25 : 0
                ])
                ->has(
                    $this->indicator->factory(5)->sequence(fn (Sequence $sequence) => [
                        'description' => 'Indicator ' . $sequence->index % 5 + 1,
                    ])
                )
            )
            ->create([
                'likert_scale_id' => LikertScale::first()->id,
                'published' => 1,
            ]);
        $this->command->info('Done! Fake evaluation forms created.');

        $this->command->line('Create fake departments, courses, subjects, and users...');
        $departments = $this->department
            ->factory(10)
            ->has(
                $this->course->factory(2)
            )
            ->has(
                $this->subject->factory(5)
            )
            ->create();
        $departments->each(function (Department $department) {
            $users = $this->user->factory(10)->create([
                'password' => Hash::make('123456')
            ]);
            $users->each(function (User $user) use ($department) {
                $user->departments()->attach($department);
                $user->assignRole('Teaching');
            });
            
            $user = $this->user->factory()->create([
                'password' => Hash::make('123456')
            ]);
            $user->departments()->attach($department);
            $user->assignRole('Dean');
        });
        $this->command->info('Done! Fake departments, courses, subjects, and users created.');
    }
}
