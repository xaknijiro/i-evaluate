<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserFakeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::all()->each(function (Department $department) {
            User::factory()
                ->hasAttached($department)
                ->count(10)->create();
        });
    }
}
