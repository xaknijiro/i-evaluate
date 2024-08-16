<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(User $user): void
    {
        // Default User
        $defaultUser = $user->newQuery()
            ->firstOrCreate(
                [
                    'email' => 'dave.medrano@example.com',
                ],
                [
                    'institution_id' => '01234567891',
                    'first_name' => 'Dave',
                    'last_name' => 'Medrano',
                    'gender' => 'Male',
                    'password' => Hash::make('123456'),
                ]
            );

        $this->call([
            RoleSeeder::class,

            SemesterSeeder::class,
            DepartmentSeeder::class,
            CourseSeeder::class,
            SubjectSeeder::class,

            LikertScaleSeeder::class,
            EvaluationTypeSeeder::class,
            EvaluationFormSeeder::class,
        ]);

        $defaultUser->assignRole('Evaluation Manager');
    }
}
