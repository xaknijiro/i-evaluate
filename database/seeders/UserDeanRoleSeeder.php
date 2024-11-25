<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserDeanRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = [-1];
        $users = User::whereIn('id', $userIds)->get();
        $users->each(function (User $user) {
            if (! $user->hasRole('Dean')) {
                $user->assignRole('Dean');
            }
        });
    }
}
