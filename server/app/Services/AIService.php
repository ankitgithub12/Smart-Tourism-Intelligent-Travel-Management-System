<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('AI_SERVICE_URL', 'http://localhost:8001');
    }

    public function chat($message)
    {
        return $this->post('/chat', ['message' => $message]);
    }

    public function recommend($preferences)
    {
        return $this->post('/recommend', ['preferences' => $preferences]);
    }

    public function predictCrowd($locationData)
    {
        return $this->post('/crowd-predict', ['location_data' => $locationData]);
    }

    public function analyzeSentiment($text)
    {
        return $this->post('/sentiment', ['text' => $text]);
    }

    protected function post($endpoint, $data)
    {
        try {
            $response = Http::post($this->baseUrl . $endpoint, $data);
            if ($response->successful()) {
                return $response->json();
            }
            Log::error("AI Service Error at {$endpoint}: " . $response->body());
        } catch (\Exception $e) {
            Log::error("AI Service Exception at {$endpoint}: " . $e->getMessage());
        }
        return null;
    }
}
