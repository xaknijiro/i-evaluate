<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserFakeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::all()->each(function (Department $department) {
            $users = User::factory()
                ->hasAttached($department)
                ->count(5)->create([
                    'password' => Hash::make('123456'),
                ]);
            $users->each(function (User $user) {
                if (! $user->hasRole('Teaching')) {
                    $user->assignRole('Teaching');
                }
            });
        });
    }
}
