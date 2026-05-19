<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guide extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'rating',
        'experience',
        'languages',
        'price_per_day'
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'rating' => 'decimal:2',
    ];
}
