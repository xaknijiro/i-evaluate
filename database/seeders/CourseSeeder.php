<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use Exception;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(Department $department, Course $course): void
    {
        $departments = $department->all();
        $departments->each(function ($department) use ($course) {
            $departmentCode = strtolower($department->code);
            try {
                $jsonString = file_get_contents(base_path("database/seeders/json/{$departmentCode}_courses.json"));
                $data = json_decode($jsonString, true);
                $courseSeeds = $data['courses'];
                foreach ($courseSeeds as $courseSeed) {
                    $course->newQuery()
                        ->firstOrCreate(
                            [
                                'code' => $courseSeed['code'],
                                'department_id' => $department->id,
                            ],
                            [
                                'title' => $courseSeed['title'],
                            ]
                        );
                }
            } catch (Exception $e) {
                $this->command->info("  No {$department->code} courses to load.");
            }
        });
    }
}
