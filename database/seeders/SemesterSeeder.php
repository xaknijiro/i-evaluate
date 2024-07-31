<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(Semester $semester): void
    {
        $semesters = ['1st Semester', '2nd Semester'];
        foreach ($semesters as $title) {
            $semester->newQuery()->firstOrCreate(
                [
                    'title' => $title,
                ]
            );
        }
    }
}
