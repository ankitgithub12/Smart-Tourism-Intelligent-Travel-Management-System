<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index($placeId)
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('reviews.tourist_place_id', $placeId)
            ->select('reviews.*', 'users.name as user_name')
            ->orderBy('reviews.created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function all()
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->select('reviews.*', 'users.name as user_name')
            ->orderBy('reviews.created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
        ]);

        $sentiment_score = null;
        $sentiment_label = null;

        $ai_result = $this->aiService->analyzeSentiment($request->comment);
        if ($ai_result && isset($ai_result['sentiment'][0])) {
            $sentiment_label = $ai_result['sentiment'][0]['label'];
            $sentiment_score = $ai_result['sentiment'][0]['score'];
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
