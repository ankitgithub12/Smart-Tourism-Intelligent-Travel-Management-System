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
            ->with(['agencyPackage.agency', 'hotel', 'cabService', 'foodPackage', 'guide', 'agencyGuide.agency', 'rentalVehicle', 'agencyVehicle.agency'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getTrip($tripId, $userId)
    {
        return $this->model->where('id', $tripId)
            ->where('user_id', $userId)
            ->with(['agencyPackage.agency', 'hotel', 'cabService', 'foodPackage', 'guide', 'agencyGuide.agency', 'rentalVehicle', 'agencyVehicle.agency', 'payment'])
            ->first();
    }
}
