<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TouristPlace extends Model
{
    use HasFactory;

    protected $table = 'tourist_places';

    protected $fillable = [
        'name',
        'description',
        'location',
        'category',
        'image',
        'crowd_level',
        'rating',
        'opening_hours',
        'entry_fee',
        'latitude',
        'longitude',
        'deleted_at',
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'entry_fee'     => 'decimal:2',
        'rating'        => 'decimal:2',
        'crowd_level'   => 'integer',
        'latitude'      => 'decimal:7',
        'longitude'     => 'decimal:7',
        'deleted_at'    => 'datetime',
    ];

    /* ─── Relationships ──────────────────────────────────────────────────── */

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'tourist_place_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'tourist_place_id');
    }

    public function favorites()
    {
        return $this->hasMany(UserFavorite::class, 'tourist_place_id');
    }

    /* ─── Accessors ──────────────────────────────────────────────────────── */

    /**
     * Crowd status label based on crowd_level (0-100).
     */
    public function getCrowdStatusAttribute(): string
    {
        return match (true) {
            $this->crowd_level >= 80 => 'critical',
            $this->crowd_level >= 60 => 'high',
            $this->crowd_level >= 30 => 'medium',
            default                  => 'low',
        };
    }
}
