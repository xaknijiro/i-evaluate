<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Subject;
use Exception;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(Department $department, Subject $subject): void
    {
        $departments = $department->all();
        $departments->each(function ($department) use ($subject) {
            $departmentCode = strtolower($department->code);
            try {
                $jsonString = file_get_contents(base_path("database/seeders/json/{$departmentCode}_subjects.json"));
                $data = json_decode($jsonString, true);
                $subjectSeeds = $data['subjects'];
                foreach ($subjectSeeds as $subjectSeed) {
                    $subject->newQuery()
                        ->firstOrCreate(
                            [
                                'code' => $subjectSeed['code'],
                                'department_id' => $department->id,
                            ],
                            [
                                'title' => $subjectSeed['title'],
                            ]
                        );
                }
            } catch (Exception $e) {
                $this->command->info("  No {$department->code} subjects to load.");
            }
        });
    }
}
