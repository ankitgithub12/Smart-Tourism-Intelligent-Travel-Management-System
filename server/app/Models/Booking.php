<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'tourist_place_id', 'booking_date',
        'time_slot', 'number_of_people', 'total_price',
        'status', 'payment_status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(TouristPlace::class, 'tourist_place_id');
    }
}
