<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transport extends Model
{
    protected $fillable = [
        'vehicle_type', 'vehicle_number', 'route_name',
        'current_location', 'capacity', 'current_load', 'status'
    ];
}
