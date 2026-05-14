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
});

// Tourist Place Routes
Route::get('/places', [PlaceController::class, 'index']);
Route::get('/places/{id}', [PlaceController::class, 'show']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/places', [PlaceController::class, 'store']);
});

// Booking Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
});

// Transport Routes
Route::get('/transports', [TransportController::class, 'index']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::patch('/transports/{id}/load', [TransportController::class, 'updateLoad']);
});

// AI Service Proxy Routes
Route::prefix('ai')->group(function () {
    Route::post('/chat', [AIServiceController::class, 'chat']);
    Route::post('/recommend', [AIServiceController::class, 'recommend']);
    Route::post('/crowd-predict', [AIServiceController::class, 'crowdPredict']);
    Route::post('/sentiment', [AIServiceController::class, 'sentiment']);
});
