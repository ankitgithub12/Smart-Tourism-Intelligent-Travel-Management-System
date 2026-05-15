<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'       => 'Admin Authority',
                'email'      => 'admin@tourism.gov.in',
                'password'   => Hash::make('password123'),
                'role'       => 'authority',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Rajasthan Travel Agency',
                'email'      => 'agency@rajasthan.travel',
                'password'   => Hash::make('password123'),
                'role'       => 'agency',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Ankit Sharma',
                'email'      => 'tourist@demo.com',
                'password'   => Hash::make('password123'),
                'role'       => 'tourist',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'       => 'Priya Patel',
                'email'      => 'priya@demo.com',
                'password'   => Hash::make('password123'),
                'role'       => 'tourist',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);
    }
}
