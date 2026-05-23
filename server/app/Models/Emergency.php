<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Emergency extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'location',
        'type',
        'severity',
        'status',
        'reporter',
        'time_reported',
    ];
}
