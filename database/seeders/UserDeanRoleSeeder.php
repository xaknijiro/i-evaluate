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
        $userEmails = [
            'ginard.guaki@kcp.edu.ph',
            'orlando.ananey@kcp.edu.ph',
            'noel.aniceto@kcp.edu.ph',
            'garry.panaten@kcp.edu.ph',
            'ruth.waclin@kcp.edu.ph',
        ];
        $users = User::whereIn('email', $userEmails)->get();
        $users->each(function (User $user) {
            if (! $user->hasRole('Dean')) {
                $user->assignRole('Dean');
            }
        });
    }
}
