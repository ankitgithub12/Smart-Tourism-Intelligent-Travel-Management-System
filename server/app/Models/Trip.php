<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'from_location',
        'to_destination',
        'departure_date',
        'return_date',
        'travelers',
        'hotel_id',
        'food_package_id',
        'cab_service_id',
        'guide_id',
        'rental_vehicle_id',
        'subtotal',
        'tax',
        'discount',
        'total_price',
        'status'
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
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

    public function rentalVehicle()
    {
        return $this->belongsTo(RentalVehicle::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
