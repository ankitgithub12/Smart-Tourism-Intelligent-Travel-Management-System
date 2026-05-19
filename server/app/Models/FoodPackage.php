<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'type',
        'price_per_day',
        'description',
        'emoji'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
    ];
}
