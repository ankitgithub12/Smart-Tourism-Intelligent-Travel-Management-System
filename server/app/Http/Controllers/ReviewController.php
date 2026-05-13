<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        // Optional: Call AI Service for Sentiment Analysis
        $sentiment_score = null;
        $sentiment_label = null;

        try {
            $ai_response = Http::post(env('AI_SERVICE_URL', 'http://localhost:8001') . '/sentiment', [
                'text' => $request->comment
            ]);

            if ($ai_response->successful()) {
                $data = $ai_response->json();
                // Depending on model output format, extract score/label
                // This is a placeholder for actual extraction logic
                $sentiment_label = $data['sentiment'][0]['label'] ?? null;
                $sentiment_score = $data['sentiment'][0]['score'] ?? null;
            }
        } catch (\Exception $e) {
            // Log error but continue
        }

        $id = DB::table('reviews')->insertGetId([
            'user_id' => $request->user()->id,
            'tourist_place_id' => $request->tourist_place_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'sentiment_score' => $sentiment_score,
            'sentiment_label' => $sentiment_label,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Review submitted successfully'], 201);
    }
}
