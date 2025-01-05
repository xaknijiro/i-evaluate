<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class UserDeanRoleFakeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = Department::with('users')
            ->withCount([
                'users as dean_users_count' => function ($query) {
                    $query->whereHas('roles', function ($query) {
                        $query->where('name', 'Dean');
                    });
                },
            ])
            ->having('dean_users_count', 0)
            ->get();
        $departments->each(function ($department) {
            $user = $department->users->random();
            $user->assignRole('Dean');
        });
    }
}
