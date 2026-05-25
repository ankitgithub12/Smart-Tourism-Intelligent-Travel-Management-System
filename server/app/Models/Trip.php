<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'traveler_name',
        'from_location',
        'to_destination',
        'departure_date',
        'return_date',
        'travelers',
        'agency_package_id',
        'hotel_id',
        'food_package_id',
        'cab_service_id',
        'guide_id',
        'agency_guide_id',
        'rental_vehicle_id',
        'agency_vehicle_id',
        'subtotal',
        'tax',
        'discount',
        'total_price',
        'status',
        'cancelled_at',
        'rating',
        'rating_comment',
        'rated_at',
        'special_requests',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'cancelled_at' => 'datetime',
        'rating' => 'integer',
        'rated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function agencyPackage()
    {
        return $this->belongsTo(AgencyPackage::class);
    }

    public function foodPackage()
    {
        return $this->belongsTo(FoodPackage::class);
    }

    public function cabService()
    {
        return $this->belongsTo(CabService::class);
    }

    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }

    public function agencyGuide()
    {
        return $this->belongsTo(AgencyGuide::class, 'agency_guide_id');
    }

    public function rentalVehicle()
    {
        return $this->belongsTo(RentalVehicle::class);
    }

    public function agencyVehicle()
    {
        return $this->belongsTo(AgencyVehicle::class, 'agency_vehicle_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
