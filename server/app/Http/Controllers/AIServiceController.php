<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIServiceController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function chat(Request $request)
    {
        // Support both single message and full message history
        if ($request->has('messages')) {
            // New format: full message history for context awareness
            $request->validate(['messages' => 'required|array']);
            $messages = $request->messages;
        } else {
            // Legacy format: single message
            $request->validate(['message' => 'required|string']);
            $messages = [
                ['role' => 'user', 'content' => $request->message]
            ];
        }
        
        try {
            $result = $this->aiService->chat($messages);
            return response()->json($result ?: ['reply' => 'AI Service is currently unavailable.']);
        } catch (\Exception $e) {
            Log::error('Chat Error: ' . $e->getMessage());
            return response()->json([
                'reply' => 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.'
            ]);
        }
    }

    public function recommend(Request $request)
    {
        $request->validate(['preferences' => 'required|string']);
        $result = $this->aiService->recommend($request->preferences);
        return response()->json($result ?: ['recommendation' => []]);
    }

    public function crowdPredict(Request $request)
    {
        $request->validate([
            'location_data' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
        
        $result = $this->aiService->predictCrowd(
            $request->location_data,
            $request->latitude !== null ? (float) $request->latitude : null,
            $request->longitude !== null ? (float) $request->longitude : null
        );
        return response()->json($result ?: ['prediction' => null]);
    }

    public function sentiment(Request $request)
    {
        $request->validate(['text' => 'required|string']);
        $result = $this->aiService->analyzeSentiment($request->text);
        return response()->json($result ?: ['sentiment' => null]);
    }
}
