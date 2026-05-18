<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AIService
{
    protected string $hfToken;
    protected string $hfBase = 'https://api-inference.huggingface.co/models';

    // Hugging Face model endpoints
    protected string $chatModel        = 'google/flan-t5-base';
    protected string $embeddingModel   = 'sentence-transformers/all-MiniLM-L6-v2';
    protected string $classifyModel    = 'facebook/bart-large-mnli';
    protected string $sentimentModel   = 'distilbert-base-uncased-finetuned-sst-2-english';

    public function __construct()
    {
        $this->hfToken = env('HF_API_TOKEN', '');
    }

    /* ─── Public Methods ─────────────────────────────────────────────────── */

    /**
     * Chat assistant — answers tourism-related questions.
     */
    public function chat(string $message): array
    {
        $cacheKey = 'ai_chat_' . md5($message);

        return Cache::remember($cacheKey, 300, function () use ($message) {
            $prompt = "You are a helpful smart tourism assistant. Answer this question about travel, destinations, or bookings: {$message}";

            $result = $this->callHF($this->chatModel, [
                'inputs'     => $prompt,
                'parameters' => ['max_new_tokens' => 200, 'temperature' => 0.7],
            ]);

            if ($result && isset($result[0]['generated_text'])) {
                $reply = trim(str_replace($prompt, '', $result[0]['generated_text']));
                return ['reply' => $reply ?: $result[0]['generated_text']];
            }

            return ['reply' => 'I can help you explore amazing destinations! What would you like to know?'];
        });
    }

    /**
     * Recommend destinations based on user preferences using zero-shot classification.
     */
    public function recommend(string $preferences): array
    {
        $cacheKey = 'ai_recommend_' . md5($preferences);

        return Cache::remember($cacheKey, 600, function () use ($preferences) {
            $candidateLabels = [
                'beaches and coastal areas',
                'mountain trekking and adventure',
                'historical monuments and culture',
                'wildlife and nature parks',
                'religious and spiritual sites',
                'luxury resorts and relaxation',
                'urban city tours and shopping',
                'rural and village experiences',
            ];

            $result = $this->callHF($this->classifyModel, [
                'inputs'     => $preferences,
                'parameters' => ['candidate_labels' => $candidateLabels],
            ]);

            if ($result && isset($result['labels'])) {
                $top = array_slice($result['labels'], 0, 3);
                $scores = array_slice($result['scores'], 0, 3);

                $recommendations = array_map(function ($label, $score) {
                    return [
                        'category' => $label,
                        'confidence' => round($score * 100, 1),
                        'reason' => "Matched {$label} based on your preferences.",
                    ];
                }, $top, $scores);

                return ['recommendations' => $recommendations];
            }

            return ['recommendations' => []];
        });
    }

    /**
     * Predict crowd level for a location using zero-shot classification.
     */
    public function predictCrowd(string $locationData): array
    {
        $cacheKey = 'ai_crowd_' . md5($locationData);

        return Cache::remember($cacheKey, 180, function () use ($locationData) {
            $result = $this->callHF($this->classifyModel, [
                'inputs'     => "Crowd prediction for: {$locationData}",
                'parameters' => ['candidate_labels' => ['low crowd', 'medium crowd', 'high crowd', 'very high crowd']],
            ]);

            if ($result && isset($result['labels'])) {
                $topLabel = $result['labels'][0];
                $topScore = round($result['scores'][0] * 100, 1);

                $levelMap = [
                    'low crowd'       => 'low',
                    'medium crowd'    => 'medium',
                    'high crowd'      => 'high',
                    'very high crowd' => 'critical',
                ];

                return [
                    'prediction' => [
                        'level'      => $levelMap[$topLabel] ?? 'medium',
                        'label'      => ucfirst($levelMap[$topLabel] ?? 'medium'),
                        'confidence' => $topScore,
                        'advice'     => $this->getCrowdAdvice($levelMap[$topLabel] ?? 'medium'),
                    ],
                ];
            }

            return ['prediction' => ['level' => 'medium', 'label' => 'Medium', 'confidence' => 0, 'advice' => 'Moderate crowd expected.']];
        });
    }

    /**
     * Analyse sentiment of a review text.
     */
    public function analyzeSentiment(string $text): array
    {
        $cacheKey = 'ai_sentiment_' . md5($text);

        return Cache::remember($cacheKey, 3600, function () use ($text) {
            $result = $this->callHF($this->sentimentModel, ['inputs' => $text]);

            if ($result && isset($result[0])) {
                $sentiments = $result[0];
                usort($sentiments, fn($a, $b) => $b['score'] <=> $a['score']);

                return [
                    'sentiment' => $sentiments,
                    'label'     => $sentiments[0]['label'] ?? 'NEUTRAL',
                    'score'     => round(($sentiments[0]['score'] ?? 0) * 100, 1),
                ];
            }

            return ['sentiment' => [], 'label' => 'NEUTRAL', 'score' => 50.0];
        });
    }

    /* ─── Private Helpers ────────────────────────────────────────────────── */

    /**
     * Make a POST request to Hugging Face Inference API.
     */
    protected function callHF(string $model, array $payload): ?array
    {
        if (empty($this->hfToken)) {
            Log::warning('HF_API_TOKEN is not set.');
            return null;
        }

        try {
            $response = Http::withToken($this->hfToken)
                ->timeout(30)
                ->post("{$this->hfBase}/{$model}", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            // Handle model loading (503)
            if ($response->status() === 503) {
                Log::info("HF model {$model} is loading, retrying in 5s...");
                sleep(5);
                $retry = Http::withToken($this->hfToken)->timeout(30)->post("{$this->hfBase}/{$model}", $payload);
                return $retry->successful() ? $retry->json() : null;
            }

            Log::error("HF API Error [{$model}] {$response->status()}: " . $response->body());
        } catch (\Exception $e) {
            Log::error("HF API Exception [{$model}]: " . $e->getMessage());
        }

        return null;
    }

    protected function getCrowdAdvice(string $level): string
    {
        return match ($level) {
            'low'      => 'Great time to visit! Minimal waiting time expected.',
            'medium'   => 'Moderate crowd. Visit early morning for best experience.',
            'high'     => 'High crowd expected. Book tickets in advance.',
            'critical' => 'Very crowded. Consider visiting on a weekday or off-season.',
            default    => 'Check local conditions before visiting.',
        };
    }
}
