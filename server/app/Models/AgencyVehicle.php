<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyVehicle extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'model',
        'type',
        'driver',
        'current_load',
        'status',
        'fuel',
        'location',
    ];
}
