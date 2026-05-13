<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIRecommendation extends Model
{
    protected $table = 'ai_recommendations';
    
    protected $fillable = [
        'user_id', 'query_text', 'recommendations'
    ];

    protected $casts = [
        'recommendations' => 'json'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
