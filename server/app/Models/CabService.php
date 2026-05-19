<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CabService extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'type',
        'price',
        'description'
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];
}
