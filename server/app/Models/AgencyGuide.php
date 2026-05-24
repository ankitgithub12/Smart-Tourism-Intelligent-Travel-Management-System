<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyGuide extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'agency_id',
        'name',
        'specialty',
        'rating',
        'status',
        'active_tours',
        'contact',
    ];

    protected $casts = [
        'rating' => 'float',
        'active_tours' => 'integer',
    ];
}
