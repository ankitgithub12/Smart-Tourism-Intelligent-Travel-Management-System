<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;

class AIServiceController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string']);
        $result = $this->aiService.chat($request->message);
        return response()->json($result ?: ['reply' => 'AI Service is currently unavailable.']);
    }

    public function recommend(Request $request)
    {
        $request->validate(['preferences' => 'required|string']);
        $result = $this->aiService.recommend($request->preferences);
        return response()->json($result ?: ['recommendation' => []]);
    }

    public function crowdPredict(Request $request)
    {
        $request->validate(['location_data' => 'required|string']);
        $result = $this->aiService.predictCrowd($request->location_data);
        return response()->json($result ?: ['prediction' => null]);
    }

    public function sentiment(Request $request)
    {
        $request->validate(['text' => 'required|string']);
        $result = $this->aiService.analyzeSentiment($request->text);
        return response()->json($result ?: ['sentiment' => null]);
    }
}
