<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Helpers\TourismContextAnalyzer;

class AIService
{
    protected string $geminiApiKey;
    protected string $openRouterToken;
    protected string $apiBase = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Default model to use via OpenRouter
    protected string $chatModel = 'google/gemini-2.5-flash:free';

    public function __construct()
    {
        $this->geminiApiKey = env('GEMINI_API_KEY', '');
        $this->openRouterToken = env('OPENROUTER_API_KEY', '');
    }

    /* ─── Public Methods ────────────────────────────────────────────────── */

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

        // Format user history messages (excluding system)
        $formattedMessages = [];
        foreach (array_slice($messages, -6) as $msg) {
            $formattedMessages[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'content' => $msg['content']
            ];
        }

        $reply = $this->callAI($formattedMessages, $systemPrompt);

        if (!empty($reply)) {
            return ['reply' => trim($reply), 'context' => $context];
        }

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

            $reply = $this->callAI([['role' => 'user', 'content' => $prompt]]);

            if (!empty($reply)) {
                $content = trim($reply);
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

            $reply = $this->callAI([['role' => 'user', 'content' => $prompt]]);

            if (!empty($reply)) {
                $content = trim($reply);
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

            $reply = $this->callAI([['role' => 'user', 'content' => $prompt]]);

            if (!empty($reply)) {
                $content = trim($reply);
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
     * Universal router for AI backend requests (native Gemini vs OpenRouter)
     */
    protected function callAI(array $messages, string $systemPrompt = '', int $maxTokens = 2500): ?string
    {
        if (!empty($this->geminiApiKey)) {
            $reply = $this->callGeminiDirect($messages, $systemPrompt, $maxTokens);
            if (!empty($reply)) {
                return $reply;
            }
            Log::warning("Gemini Direct failed or rate-limited. Falling back to OpenRouter.");
        }

        // Convert messages to role formatting suitable for OpenRouter System/User standard
        $formattedMessages = [];
        if (!empty($systemPrompt)) {
            $formattedMessages[] = ['role' => 'system', 'content' => $systemPrompt];
        }
        foreach ($messages as $msg) {
            $role = ($msg['role'] === 'model' || $msg['role'] === 'assistant') ? 'assistant' : 'user';
            $formattedMessages[] = ['role' => $role, 'content' => $msg['content']];
        }

        $result = $this->callOpenRouter($this->chatModel, $formattedMessages, $maxTokens);
        return $result['choices'][0]['message']['content'] ?? null;
    }

    /**
     * Make direct request to Google AI Studio Gemini API with model fallbacks
     */
    protected function callGeminiDirect(array $messages, string $systemPrompt = '', int $maxTokens = 2500): ?string
    {
        $models = ['gemini-2.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];

        foreach ($models as $model) {
            try {
                $contents = [];
                foreach ($messages as $msg) {
                    $role = $msg['role'] === 'model' ? 'model' : 'user';
                    $contents[] = [
                        'role' => $role,
                        'parts' => [
                            ['text' => $msg['content']]
                        ]
                    ];
                }

                $payload = [
                    'contents' => $contents,
                    'generationConfig' => [
                        'maxOutputTokens' => $maxTokens,
                    ]
                ];

                if (!empty($systemPrompt)) {
                    $payload['systemInstruction'] = [
                        'parts' => [
                            ['text' => $systemPrompt]
                        ]
                    ];
                }

                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $this->geminiApiKey;

                $response = Http::timeout(20)->post($endpoint, $payload);

                if ($response->successful()) {
                    $data = $response->json();
                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if (!empty($text)) {
                        return $text;
                    }
                }

                Log::warning("Gemini Direct Model {$model} failed: " . $response->status() . " " . $response->body());
            } catch (\Exception $e) {
                Log::error("Gemini Direct Model {$model} Exception: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Make a POST request to OpenRouter API with free-tier model fallbacks.
     */
    protected function callOpenRouter(string $defaultModel, array $messages, int $maxTokens = 2500): ?array
    {
        if (empty($this->openRouterToken)) {
            Log::warning('OPENROUTER_API_KEY is not set. Returning null for AI request.');
            return null;
        }

        $models = [
            'meta-llama/llama-3-8b-instruct:free',
            'qwen/qwen-2-7b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
            'google/gemini-flash-1.5:free'
        ];

        // Insert the default request model at the start of the try-list
        if (!in_array($defaultModel, $models)) {
            array_unshift($models, $defaultModel);
        }

        foreach ($models as $model) {
            // Clean suffix if OpenRouter issues 404 for gemini-2.5-flash:free
            $modelClean = ($model === 'google/gemini-2.5-flash:free') ? 'google/gemini-2.5-flash' : $model;

            try {
                $response = Http::withToken($this->openRouterToken)
                    ->withHeaders([
                        'HTTP-Referer' => config('app.url'),
                        'X-Title' => 'Smart Tourism AI'
                    ])
                    ->timeout(20)
                    ->post($this->apiBase, [
                        'model' => $modelClean,
                        'messages' => $messages,
                        'max_tokens' => $maxTokens,
                    ]);

                if ($response->successful()) {
                    $json = $response->json();
                    if (isset($json['choices'][0]['message']['content'])) {
                        return $json;
                    }
                }

                Log::warning("OpenRouter Model {$modelClean} failed: " . $response->status() . " " . $response->body());
            } catch (\Exception $e) {
                Log::error("OpenRouter Model {$modelClean} Exception: " . $e->getMessage());
            }
        }

        return null;
    }
}
