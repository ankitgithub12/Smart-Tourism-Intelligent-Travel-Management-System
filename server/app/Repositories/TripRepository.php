<?php

namespace App\Repositories;

use App\Models\Trip;

class TripRepository extends BaseRepository
{
    public function __construct(Trip $model)
    {
        parent::__construct($model);
    }

    public function getUserTrips($userId)
    {
        return $this->model->where('user_id', $userId)
            ->with(['hotel', 'cabService', 'foodPackage', 'guide', 'rentalVehicle'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
