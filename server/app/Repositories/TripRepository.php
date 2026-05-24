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
            ->with(['agencyPackage', 'hotel', 'cabService', 'foodPackage', 'guide', 'agencyGuide', 'rentalVehicle', 'agencyVehicle'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTrip($tripId, $userId)
    {
        return $this->model->where('id', $tripId)
            ->where('user_id', $userId)
            ->with(['agencyPackage', 'hotel', 'cabService', 'foodPackage', 'guide', 'agencyGuide', 'rentalVehicle', 'agencyVehicle', 'payment'])
            ->first();
    }
}
