<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Helpers\TourismContextAnalyzer;

class AIService
{
    protected string $openRouterToken;
    protected string $apiBase = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Default model to use via OpenRouter
    protected string $chatModel = 'google/gemini-2.5-flash'; // High-speed, high-quality, or 'openai/gpt-3.5-turbo'

    public function __construct()
    {
        $this->openRouterToken = env('OPENROUTER_API_KEY', '');
    }

    /* ─── Public Methods ─────────────────────────────────────────────────── */

    /**
     * Chat assistant — answers tourism-related questions with context awareness.
     */
    public function chat(array $messages): array
    {
        $context = TourismContextAnalyzer::extractContext($messages);
        
        $contextInfo = "Destinations: " . implode(', ', $context['destinations']) . "\n";
        $contextInfo .= "Trip type: {$context['trip_type']}\n";
        
        $systemPrompt = "
You are Smart Tourism AI, an expert travel assistant that helps tourists plan trips naturally and intelligently.
Keep responses concise (2-3 sentences max), friendly, and human-like. Always provide VALUE: attractions, activities, food, best time, travel tips.
Current known context:
{$contextInfo}
";

        // Format messages for OpenRouter (OpenAI compatible)
        $formattedMessages = [
            ['role' => 'system', 'content' => $systemPrompt]
        ];

        // Add last 6 messages
        foreach (array_slice($messages, -6) as $msg) {
            $formattedMessages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['content']
            ];
        }

        $result = $this->callOpenRouter($this->chatModel, $formattedMessages);

        if ($result && isset($result['choices'][0]['message']['content'])) {
            $reply = trim($result['choices'][0]['message']['content']);
            if (!empty($reply)) {
                return ['reply' => $reply, 'context' => $context];
            }
        }

        // Generic fallback if API fails
        return [
            'reply' => "Hello! I'm here to help you plan an amazing trip. Where would you like to go?",
            'context' => $context
        ];
    }

    /**
     * Recommend destinations based on user preferences using LLM.
     */
    public function recommend(string $preferences): array
    {
        $cacheKey = 'ai_recommend_or_' . md5($preferences);

        return Cache::remember($cacheKey, 600, function () use ($preferences) {
            $prompt = "Based on these preferences: '{$preferences}', recommend 3 travel categories from this list: beaches, mountains, heritage, wildlife, spiritual, luxury, urban, rural.
Return EXACTLY a JSON array of objects with keys 'category', 'confidence' (number 0-100), and 'reason'. Do not include markdown code blocks, just raw JSON.";

            $result = $this->callOpenRouter($this->chatModel, [
                ['role' => 'user', 'content' => $prompt]
            ]);

            if ($result && isset($result['choices'][0]['message']['content'])) {
                $content = trim($result['choices'][0]['message']['content']);
                // Clean markdown code blocks if any
                $content = preg_replace('/```json\s*/', '', $content);
                $content = preg_replace('/```/', '', $content);
                
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    return ['recommendations' => $decoded];
                }
            }

            return ['recommendations' => []];
        });
    }

    /**
     * Predict crowd level for a location.
     */
    public function predictCrowd(string $locationData): array
    {
        $cacheKey = 'ai_crowd_or_' . md5($locationData);

        return Cache::remember($cacheKey, 180, function () use ($locationData) {
            $prompt = "Estimate the current crowd level for '{$locationData}'. 
Return EXACTLY a JSON object with keys: 'level' (one of: low, medium, high, critical), 'label' (capitalized level), 'confidence' (number 0-100), and 'advice' (short sentence). Do not include markdown code blocks, just raw JSON.";

            $result = $this->callOpenRouter($this->chatModel, [
                ['role' => 'user', 'content' => $prompt]
            ]);

            if ($result && isset($result['choices'][0]['message']['content'])) {
                $content = trim($result['choices'][0]['message']['content']);
                $content = preg_replace('/```json\s*/', '', $content);
                $content = preg_replace('/```/', '', $content);
                
                $decoded = json_decode($content, true);
                if (is_array($decoded) && isset($decoded['level'])) {
                    return ['prediction' => $decoded];
                }
            }

            return ['prediction' => ['level' => 'medium', 'label' => 'Medium', 'confidence' => 0, 'advice' => 'Moderate crowd expected.']];
        });
    }

    /**
     * Analyse sentiment of a review text.
     */
    public function analyzeSentiment(string $text): array
    {
        $cacheKey = 'ai_sentiment_or_' . md5($text);

        return Cache::remember($cacheKey, 3600, function () use ($text) {
            $prompt = "Analyze the sentiment of this text: '{$text}'.
Return EXACTLY a JSON object with keys: 'label' (POSITIVE, NEGATIVE, or NEUTRAL) and 'score' (number 0-100 indicating confidence). Do not include markdown code blocks, just raw JSON.";

            $result = $this->callOpenRouter($this->chatModel, [
                ['role' => 'user', 'content' => $prompt]
            ]);

            if ($result && isset($result['choices'][0]['message']['content'])) {
                $content = trim($result['choices'][0]['message']['content']);
                $content = preg_replace('/```json\s*/', '', $content);
                $content = preg_replace('/```/', '', $content);
                
                $decoded = json_decode($content, true);
                if (is_array($decoded) && isset($decoded['label'])) {
                    return [
                        'sentiment' => [['label' => $decoded['label'], 'score' => $decoded['score'] / 100]],
                        'label'     => $decoded['label'],
                        'score'     => $decoded['score'],
                    ];
                }
            }

            return ['sentiment' => [], 'label' => 'NEUTRAL', 'score' => 50.0];
        });
    }

    /* ─── Private Helpers ────────────────────────────────────────────────── */

    /**
     * Make a POST request to OpenRouter API.
     */
    protected function callOpenRouter(string $model, array $messages, int $maxTokens = 300): ?array
    {
        if (empty($this->openRouterToken)) {
            Log::warning('OPENROUTER_API_KEY is not set. Returning null for AI request.');
            return null;
        }

        try {
            $response = Http::withToken($this->openRouterToken)
                ->withHeaders([
                    'HTTP-Referer' => config('app.url'),
                    'X-Title' => 'Smart Tourism AI'
                ])
                ->timeout(30)
                ->post($this->apiBase, [
                    'model' => $model,
                    'messages' => $messages,
                    'max_tokens' => $maxTokens,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("OpenRouter API Error: " . $response->status() . " " . $response->body());
        } catch (\Exception $e) {
            Log::error("OpenRouter API Exception: " . $e->getMessage());
        }

        return null;
    }
}
