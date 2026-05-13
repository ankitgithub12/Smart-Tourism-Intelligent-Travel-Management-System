<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TouristPlace extends Model
{
    protected $fillable = [
        'name', 'description', 'location', 'category', 'image',
        'crowd_level', 'rating', 'opening_hours', 'entry_fee'
    ];

    protected $casts = [
        'opening_hours' => 'json',
        'crowd_level' => 'integer',
        'rating' => 'decimal:2',
        'entry_fee' => 'decimal:2'
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
