<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyPackage extends Model
{
    protected $fillable = [
        'name',
        'destination',
        'duration',
        'price',
        'status',
        'bookings',
        'image',
    ];
}
