<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransportSeeder extends Seeder
{
    public function run(): void
    {
        $transports = [
            [
                'vehicle_type'     => 'Electric Bus',
                'vehicle_number'   => 'RJ-14-EB-0021',
                'route_name'       => 'Pink City Circuit',
                'current_location' => 'Johari Bazar',
                'capacity'         => 40,
                'current_load'     => 34,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Electric Bus',
                'vehicle_number'   => 'RJ-14-EB-0045',
                'route_name'       => 'Heritage Loop — Amber to City Palace',
                'current_location' => 'Amer Road',
                'capacity'         => 40,
                'current_load'     => 12,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Smart Van',
                'vehicle_number'   => 'RJ-14-SV-8842',
                'route_name'       => 'Amber Fort Shuttle',
                'current_location' => 'Amer Gate',
                'capacity'         => 12,
                'current_load'     => 4,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Metro Link',
                'vehicle_number'   => 'ML-04',
                'route_name'       => 'Mansarovar — Badi Chaupar',
                'current_location' => 'Sindhi Camp',
                'capacity'         => 200,
                'current_load'     => 190,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Electric Rickshaw',
                'vehicle_number'   => 'RJ-14-ER-1102',
                'route_name'       => 'Hawa Mahal Loop',
                'current_location' => 'Badi Chaupar',
                'capacity'         => 4,
                'current_load'     => 0,
                'status'           => 'delayed',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Tourist Coach',
                'vehicle_number'   => 'RJ-14-TC-3301',
                'route_name'       => 'Airport — City Centre Express',
                'current_location' => 'Sanganer Airport',
                'capacity'         => 50,
                'current_load'     => 28,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'vehicle_type'     => 'Electric Bus',
                'vehicle_number'   => 'RJ-14-EB-0067',
                'route_name'       => 'Nahargarh — Albert Hall',
                'current_location' => 'Ram Niwas Garden',
                'capacity'         => 40,
                'current_load'     => 8,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ];

        DB::table('transports')->insert($transports);
    }
}
