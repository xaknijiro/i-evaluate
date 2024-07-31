<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departmentModel = new Department;

        $jsonString = file_get_contents(base_path('database/seeders/json/departments.json'));
        $data = json_decode($jsonString, true);
        $departmentSeeds = $data['departments'];

        foreach ($departmentSeeds as $departmentSeed) {
            $departmentModel->newQuery()
                ->firstOrCreate(
                    [
                        'code' => $departmentSeed['code'],
                    ],
                    [
                        'title' => $departmentSeed['title'],
                    ]
                );
        }
    }
}
