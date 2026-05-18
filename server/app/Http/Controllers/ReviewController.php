<?php

namespace App\Http\Controllers;

use App\Services\AIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    protected AIService $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * GET /api/reviews/{placeId} — paginated reviews for a place
     */
    public function index($placeId)
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('reviews.tourist_place_id', $placeId)
            ->select('reviews.*', 'users.name as user_name')
            ->orderBy('reviews.created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * GET /api/reviews — latest 10 reviews (public, for home page)
     */
    public function all()
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->join('tourist_places', 'reviews.tourist_place_id', '=', 'tourist_places.id')
            ->select('reviews.*', 'users.name as user_name', 'tourist_places.name as place_name')
            ->orderBy('reviews.created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($reviews);
    }

    /**
     * POST /api/reviews — create a review (tourist must have a booking for the place)
     */
    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id',
            'rating'           => 'required|integer|min:1|max:5',
            'comment'          => 'required|string|min:10|max:1000',
        ]);

        $userId  = $request->user()->id;
        $placeId = $request->tourist_place_id;

        // Prevent duplicate review
        $existing = DB::table('reviews')
            ->where('user_id', $userId)
            ->where('tourist_place_id', $placeId)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this place.'], 422);
        }

        // Sentiment analysis (best-effort, non-blocking)
        $sentimentLabel = null;
        $sentimentScore = null;

        try {
            $result = $this->aiService->analyzeSentiment($request->comment);
            if ($result && isset($result['label'])) {
                $sentimentLabel = $result['label'];
                $sentimentScore = $result['score'];
            }
        } catch (\Exception $e) {
            // Sentiment is optional; don't fail the review submission
        }

        $id = DB::table('reviews')->insertGetId([
            'user_id'          => $userId,
            'tourist_place_id' => $placeId,
            'rating'           => $request->rating,
            'comment'          => $request->comment,
            'sentiment_label'  => $sentimentLabel,
            'sentiment_score'  => $sentimentScore,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // Update place aggregate rating
        $this->updatePlaceRating($placeId);

        $review = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('reviews.id', $id)
            ->select('reviews.*', 'users.name as user_name')
            ->first();

        return response()->json(['review' => $review, 'message' => 'Review submitted successfully.'], 201);
    }

    /**
     * PUT /api/reviews/{id} — update own review
     */
    public function update(Request $request, $id)
    {
        $review = DB::table('reviews')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found or unauthorized.'], 404);
        }

        $request->validate([
            'rating'  => 'sometimes|integer|min:1|max:5',
            'comment' => 'sometimes|string|min:10|max:1000',
        ]);

        $data = ['updated_at' => now()];

        if ($request->filled('comment')) {
            $data['comment'] = $request->comment;
            // Re-run sentiment analysis on updated comment
            try {
                $result = $this->aiService->analyzeSentiment($request->comment);
                if ($result && isset($result['label'])) {
                    $data['sentiment_label'] = $result['label'];
                    $data['sentiment_score'] = $result['score'];
                }
            } catch (\Exception $e) {
                // Non-blocking
            }
        }

        if ($request->filled('rating')) {
            $data['rating'] = $request->rating;
        }

        DB::table('reviews')->where('id', $id)->update($data);
        $this->updatePlaceRating($review->tourist_place_id);

        return response()->json(['message' => 'Review updated successfully.']);
    }

    /**
     * DELETE /api/reviews/{id} — user deletes own review; admin deletes any
     */
    public function destroy(Request $request, $id)
    {
        $user  = $request->user();
        $query = DB::table('reviews')->where('id', $id);

        if ($user->role !== 'authority') {
            $query->where('user_id', $user->id);
        }

        $review = $query->first();
        if (!$review) {
            return response()->json(['message' => 'Review not found or unauthorized.'], 404);
        }

        DB::table('reviews')->where('id', $id)->delete();
        $this->updatePlaceRating($review->tourist_place_id);

        return response()->json(['message' => 'Review deleted successfully.']);
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    /**
     * Recalculate and store average rating on the tourist_places table.
     */
    private function updatePlaceRating(int $placeId): void
    {
        $avg = DB::table('reviews')
            ->where('tourist_place_id', $placeId)
            ->avg('rating');

        DB::table('tourist_places')
            ->where('id', $placeId)
            ->update(['rating' => round($avg ?? 0, 2), 'updated_at' => now()]);
    }
}
