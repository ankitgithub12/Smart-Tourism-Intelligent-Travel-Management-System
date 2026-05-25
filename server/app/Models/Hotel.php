<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'agency_id',
        'location',
        'stars',
        'price_per_night',
        'rating',
        'reviews_count',
        'image',
        'amenities',
        'status'
    ];

    protected $casts = [
        'amenities' => 'array',
        'price_per_night' => 'decimal:2',
        'rating' => 'decimal:2',
    ];
}
