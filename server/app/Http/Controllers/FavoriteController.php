<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = DB::table('user_favorites')
            ->join('tourist_places', 'user_favorites.tourist_place_id', '=', 'tourist_places.id')
            ->where('user_favorites.user_id', $request->user()->id)
            ->select('tourist_places.*', 'user_favorites.id as favorite_id', 'user_favorites.created_at as favorited_at')
            ->get();

        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tourist_place_id' => 'required|exists:tourist_places,id'
        ]);

        $userId = $request->user()->id;
        $placeId = $request->tourist_place_id;

        // Check if already favorited
        $existing = DB::table('user_favorites')
            ->where('user_id', $userId)
            ->where('tourist_place_id', $placeId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Place is already in favorites'], 409);
        }

        $id = DB::table('user_favorites')->insertGetId([
            'user_id' => $userId,
            'tourist_place_id' => $placeId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Added to favorites'], 201);
    }

    public function destroy(Request $request, $id)
    {
        // Delete by tourist_place_id for the logged-in user
        $deleted = DB::table('user_favorites')
            ->where('user_id', $request->user()->id)
            ->where('tourist_place_id', $id)
            ->delete();

        if (!$deleted) {
            // Alternatively try deleting by favorite_id
            $deleted = DB::table('user_favorites')
                ->where('user_id', $request->user()->id)
                ->where('id', $id)
                ->delete();
        }

        if (!$deleted) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }

        return response()->json(['message' => 'Removed from favorites']);
    }
}
