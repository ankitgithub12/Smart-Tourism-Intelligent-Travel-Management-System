<?php

namespace App\Services;

use App\Repositories\TripRepository;
use App\Models\AgencyGuide;
use App\Models\AgencyVehicle;
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

            $status = isset($data['status']) ? $data['status'] : 'pending';

            $tripData = array_merge($data, [
                'user_id' => $userId,
                'status' => $status,
            ]);

            $trip = $this->tripRepository->create($tripData);

            if ($status === 'confirmed') {
                if (! empty($data['agency_package_id'])) {
                    \App\Models\AgencyPackage::where('id', $data['agency_package_id'])->increment('bookings');
                }

                if (! empty($data['agency_guide_id'])) {
                    AgencyGuide::where('id', $data['agency_guide_id'])->update([
                        'status' => 'Assigned',
                        'active_tours' => DB::raw('active_tours + 1'),
                    ]);
                }

                if (! empty($data['agency_vehicle_id'])) {
                    AgencyVehicle::where('id', $data['agency_vehicle_id'])->update([
                        'status' => 'Active',
                        'current_load' => max(1, (int) ($data['travelers'] ?? 1)),
                    ]);
                }
            }

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

    public function cancelTrip($tripId, $userId)
    {
        return DB::transaction(function () use ($tripId, $userId) {
            $trip = $this->tripRepository->getTrip($tripId, $userId);

            if (! $trip) {
                return null;
            }

            if ($trip->status === 'completed') {
                throw new Exception('Completed trips cannot be cancelled.');
            }

            if ($trip->status === 'cancelled') {
                throw new Exception('Trip is already cancelled.');
            }

            $trip->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            if ($trip->agency_guide_id) {
                $guide = AgencyGuide::find($trip->agency_guide_id);
                $guide?->update([
                    'status' => 'Available',
                    'active_tours' => max(0, (int) $guide->active_tours - 1),
                ]);
            }

            if ($trip->agency_vehicle_id) {
                AgencyVehicle::where('id', $trip->agency_vehicle_id)->update([
                    'status' => 'Idle',
                    'current_load' => 0,
                ]);
            }

            return $trip->fresh(['agencyPackage', 'hotel', 'cabService', 'foodPackage', 'guide', 'agencyGuide', 'rentalVehicle', 'agencyVehicle']);
        });
    }
}
