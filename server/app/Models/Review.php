<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id', 'tourist_place_id', 'rating',
        'comment', 'sentiment_score', 'sentiment_label'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(TouristPlace::class, 'tourist_place_id');
    }
}
