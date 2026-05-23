<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SustainabilityMetric extends Model
{
    protected $fillable = [
        'eco_score',
        'carbon_offset',
        'total_plastics_collected',
        'green_fleet_ratio',
    ];
}
