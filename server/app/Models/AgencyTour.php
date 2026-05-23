<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyTour extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'package_name',
        'date',
        'time',
        'guide_name',
        'status',
        'capacity',
        'filled',
    ];
}
