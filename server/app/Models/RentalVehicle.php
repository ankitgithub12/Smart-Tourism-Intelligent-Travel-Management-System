<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalVehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'seats',
        'fuel',
        'price_per_day'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
    ];
}
