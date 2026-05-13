<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIServiceController extends Controller
{
    private $ai_service_url = 'http://127.0.0.1:8001';

    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string']);
        return $this->proxyRequest('/chat', ['message' => $request->message]);
    }

    public function recommend(Request $request)
    {
        $request->validate(['preferences' => 'required|string']);
        return $this->proxyRequest('/recommend', ['preferences' => $request->preferences]);
    }

    public function crowdPredict(Request $request)
    {
        $request->validate(['location_data' => 'required|string']);
        return $this->proxyRequest('/crowd-predict', ['location_data' => $request->location_data]);
    }

    public function sentiment(Request $request)
    {
        $request->validate(['text' => 'required|string']);
        return $this->proxyRequest('/sentiment', ['text' => $request->text]);
    }

    private function proxyRequest($endpoint, $data)
    {
        try {
            $response = Http::post($this->ai_service_url . $endpoint, $data);
            if ($response->successful()) {
                return response()->json($response->json());
            }
            return response()->json([
                'error' => 'AI Service error',
                'details' => $response->body()
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Could not connect to AI Service',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
