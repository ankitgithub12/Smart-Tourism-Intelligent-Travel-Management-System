<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Place; // Need to create model
use Illuminate\Support\Facades\DB;

class PlaceController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('tourist_places');

        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->has('q')) {
            $query->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('location', 'like', '%' . $request->q . '%');
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $place = DB::table('tourist_places')->where('id', $id)->first();
        if (!$place) {
            return response()->json(['message' => 'Place not found'], 404);
        }
        return response()->json($place);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'location' => 'required|string',
            'category' => 'required|string',
        ]);

        $id = DB::table('tourist_places')->insertGetId($request->all());
        return response()->json(['id' => $id, 'message' => 'Place created successfully'], 201);
    }
}
