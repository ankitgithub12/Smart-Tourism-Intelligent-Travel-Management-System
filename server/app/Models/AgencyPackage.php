<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyPackage extends Model
{
    protected $fillable = [
        'agency_id',
        'name',
        'destination',
        'duration',
        'price',
        'status',
        'bookings',
        'image',
        'itinerary',
    ];

    protected $casts = [
        'price' => 'float',
        'bookings' => 'integer',
    ];

    public function agency()
    {
        return $this->belongsTo(User::class, 'agency_id');
    }
}
