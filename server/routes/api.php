<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TransportController;
use App\Http\Controllers\AIServiceController;

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user', [\App\Http\Controllers\UserController::class, 'update']);
    Route::post('/reviews', [\App\Http\Controllers\ReviewController::class, 'store']);
    
    // Favorites
    Route::get('/favorites', [\App\Http\Controllers\FavoriteController::class, 'index']);
    Route::post('/favorites', [\App\Http\Controllers\FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [\App\Http\Controllers\FavoriteController::class, 'destroy']);
});
Route::get('/reviews', [\App\Http\Controllers\ReviewController::class, 'all']);
Route::get('/reviews/{placeId}', [\App\Http\Controllers\ReviewController::class, 'index']);

// Admin Stats
Route::middleware(['auth:sanctum'])->get('/admin/stats', [\App\Http\Controllers\UserController::class, 'adminStats']);

// Tourist Place Routes
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/{id}', [PlaceController::class, 'show']);
// In a real app we'd use a role middleware here, but for simplicity we'll check role in controller or just require auth for now since middleware isn't set up
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/places', [PlaceController::class, 'store']);
    Route::put('/places/{id}', [PlaceController::class, 'update']);
    Route::delete('/places/{id}', [PlaceController::class, 'destroy']);
});

// Booking Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
});

// Transport Routes
Route::get('/transports', [TransportController::class, 'index']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::patch('/transports/{id}/load', [TransportController::class, 'updateLoad']);
});

// AI Service Proxy Routes
Route::middleware(['auth:sanctum'])->prefix('ai')->group(function () {
    Route::post('/chat', [AIServiceController::class, 'chat']);
    Route::post('/recommend', [AIServiceController::class, 'recommend']);
    Route::post('/crowd-predict', [AIServiceController::class, 'crowdPredict']);
    Route::post('/sentiment', [AIServiceController::class, 'sentiment']);
});
