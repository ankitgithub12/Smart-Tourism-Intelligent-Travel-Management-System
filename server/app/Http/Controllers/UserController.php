<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function adminStats(Request $request)
    {
        // Simple role check
        if ($request->user()->role !== 'authority' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $usersCount = DB::table('users')->count();
        $bookingsCount = DB::table('bookings')->count();
        $placesCount = DB::table('tourist_places')->count();

        return response()->json([
            'users' => $usersCount,
            'bookings' => $bookingsCount,
            'places' => $placesCount,
            'securityScore' => 98
        ]);
    }
}
