<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyVehicle extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'agency_id',
        'model',
        'type',
        'driver',
        'current_load',
        'status',
        'fuel',
        'location',
        'price_per_day',
    ];

    protected $casts = [
        'current_load' => 'integer',
        'fuel' => 'integer',
        'price_per_day' => 'float',
    ];

    public function agency()
    {
        return $this->belongsTo(User::class, 'agency_id');
    }
}
