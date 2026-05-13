<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AIServiceController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// AI Routes
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AIServiceController::class, 'chat']);
    Route::post('/recommend', [AIServiceController::class, 'recommend']);
    Route::post('/crowd-predict', [AIServiceController::class, 'crowdPredict']);
    Route::post('/sentiment', [AIServiceController::class, 'sentiment']);
});

// Authentication Routes (Placeholders)
Route::post('/register', function() { return response()->json(['message' => 'Register endpoint']); });
Route::post('/login', function() { return response()->json(['message' => 'Login endpoint']); });
Route::post('/logout', function() { return response()->json(['message' => 'Logout endpoint']); })->middleware('auth:sanctum');

// Tourist Place Routes (Placeholders)
Route::get('/places', function() { return response()->json(['message' => 'Get places endpoint']); });
Route::post('/places', function() { return response()->json(['message' => 'Create place endpoint']); })->middleware('auth:sanctum');
Route::put('/places/{id}', function() { return response()->json(['message' => 'Update place endpoint']); })->middleware('auth:sanctum');
Route::delete('/places/{id}', function() { return response()->json(['message' => 'Delete place endpoint']); })->middleware('auth:sanctum');

// Booking Routes (Placeholders)
Route::get('/bookings', function() { return response()->json(['message' => 'Get bookings endpoint']); })->middleware('auth:sanctum');
Route::post('/bookings', function() { return response()->json(['message' => 'Create booking endpoint']); })->middleware('auth:sanctum');
Route::delete('/bookings/{id}', function() { return response()->json(['message' => 'Delete booking endpoint']); })->middleware('auth:sanctum');
