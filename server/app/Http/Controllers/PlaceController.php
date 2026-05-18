<?php

namespace App\Http\Controllers;

use App\Models\TouristPlace;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlaceController extends Controller
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * GET /api/places
     * Supports: category, q (search), rating_min, crowd_max, location, sort, per_page
     */
    public function index(Request $request)
    {
        $query = TouristPlace::query()->whereNull('deleted_at');

        // Category filter
        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Full-text search (name, description, location)
        if ($request->filled('q')) {
            $search = '%' . $request->q . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhere('location', 'like', $search);
            });
        }

        // Location filter
        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Min rating filter
        if ($request->filled('rating_min')) {
            $query->where('rating', '>=', (float) $request->rating_min);
        }

        // Max crowd level filter
        if ($request->filled('crowd_max')) {
            $query->where('crowd_level', '<=', (int) $request->crowd_max);
        }

        // Sorting
        $sortMap = [
            'rating'      => ['rating', 'desc'],
            'crowd_asc'   => ['crowd_level', 'asc'],
            'crowd_desc'  => ['crowd_level', 'desc'],
            'newest'      => ['created_at', 'desc'],
            'name'        => ['name', 'asc'],
        ];
        [$sortCol, $sortDir] = $sortMap[$request->sort ?? ''] ?? ['created_at', 'desc'];
        $query->orderBy($sortCol, $sortDir);

        $perPage = min((int) ($request->per_page ?? 12), 50);
        $places  = $query->paginate($perPage);

        return response()->json($places);
    }

    /**
     * GET /api/places/{id}
     */
    public function show($id)
    {
        $place = TouristPlace::withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->whereNull('deleted_at')
            ->findOrFail($id);

        return response()->json($place);
    }

    /**
     * POST /api/places (Admin / Agency only)
     */
    public function store(Request $request)
    {
        $this->authorizeRole($request, ['authority', 'agency']);

        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'location'     => 'required|string|max:255',
            'category'     => 'required|string|max:100',
            'description'  => 'nullable|string',
            'entry_fee'    => 'nullable|numeric|min:0',
            'crowd_level'  => 'nullable|integer|min:0|max:100',
            'opening_hours'=> 'nullable|array',
            'image'        => 'nullable|image|max:5120', // 5 MB
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $upload   = $this->cloudinary->upload($request->file('image'), 'tourist-places');
            $imageUrl = $upload['url'] ?? null;
        }

        $place = TouristPlace::create([
            ...$validated,
            'image'   => $imageUrl,
            'rating'  => 0.00,
            'opening_hours' => $validated['opening_hours'] ?? null,
        ]);

        return response()->json(['place' => $place, 'message' => 'Place created successfully.'], 201);
    }

    /**
     * PUT /api/places/{id} (Admin / Agency only)
     */
    public function update(Request $request, $id)
    {
        $this->authorizeRole($request, ['authority', 'agency']);

        $place = TouristPlace::whereNull('deleted_at')->findOrFail($id);

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'location'      => 'sometimes|string|max:255',
            'category'      => 'sometimes|string|max:100',
            'description'   => 'nullable|string',
            'entry_fee'     => 'nullable|numeric|min:0',
            'crowd_level'   => 'nullable|integer|min:0|max:100',
            'opening_hours' => 'nullable|array',
            'image'         => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $upload   = $this->cloudinary->upload($request->file('image'), 'tourist-places');
            $validated['image'] = $upload['url'] ?? $place->image;
        }

        $place->update($validated);

        return response()->json(['place' => $place->fresh(), 'message' => 'Place updated successfully.']);
    }

    /**
     * DELETE /api/places/{id} — soft delete (Admin only)
     */
    public function destroy(Request $request, $id)
    {
        $this->authorizeRole($request, ['authority']);

        $place = TouristPlace::whereNull('deleted_at')->findOrFail($id);
        $place->update(['deleted_at' => now()]);

        return response()->json(['message' => 'Place removed successfully.']);
    }

    /**
     * GET /api/places/{id}/reviews
     */
    public function reviews($id)
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->where('reviews.tourist_place_id', $id)
            ->select('reviews.*', 'users.name as user_name')
            ->orderBy('reviews.created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * GET /api/places/{id}/ratings-summary
     */
    public function ratingsSummary($id)
    {
        $summary = DB::table('reviews')
            ->where('tourist_place_id', $id)
            ->selectRaw('
                COUNT(*) as total,
                ROUND(AVG(rating), 2) as average,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            ')
            ->first();

        return response()->json($summary);
    }

    /**
     * GET /api/places/{id}/crowd-status
     */
    public function crowdStatus($id)
    {
        $place = TouristPlace::whereNull('deleted_at')->findOrFail($id);

        $level = match (true) {
            $place->crowd_level >= 80 => 'critical',
            $place->crowd_level >= 60 => 'high',
            $place->crowd_level >= 30 => 'medium',
            default                   => 'low',
        };

        return response()->json([
            'crowd_level' => $place->crowd_level,
            'status'      => $level,
            'label'       => ucfirst($level),
            'updated_at'  => $place->updated_at,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function authorizeRole(Request $request, array $roles): void
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, $roles)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
