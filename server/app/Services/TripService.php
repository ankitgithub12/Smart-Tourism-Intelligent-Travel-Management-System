<?php

namespace App\Services;

use App\Repositories\TripRepository;
use Exception;
use Illuminate\Support\Facades\DB;

class TripService
{
    protected $tripRepository;

    public function __construct(TripRepository $tripRepository)
    {
        $this->tripRepository = $tripRepository;
    }

    public function createTrip(array $data, $userId)
    {
        try {
            DB::beginTransaction();

            $tripData = array_merge($data, [
                'user_id' => $userId,
                'status' => 'pending',
            ]);

            $trip = $this->tripRepository->create($tripData);

            DB::commit();
            return $trip;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getUserTrips($userId)
    {
        return $this->tripRepository->getUserTrips($userId);
    }

    public function getTrip($tripId, $userId)
    {
        return $this->tripRepository->getTrip($tripId, $userId);
    }
}
