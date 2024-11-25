<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserDefaultRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereHas('departments')->get();
        $users->each(function (User $user) {
            if (! $user->hasRole('Teaching')) {
                $user->assignRole('Teaching');
            }
        });
    }
}
