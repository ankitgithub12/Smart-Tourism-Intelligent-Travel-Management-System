<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TransportController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AIServiceController;

/* ═══════════════════════════════════════════════════════════════════════════
   PUBLIC ROUTES (no auth required)
═══════════════════════════════════════════════════════════════════════════ */

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/password/email', [AuthController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// Public Places
Route::get('/places',                          [PlaceController::class, 'index']);
Route::get('/places/{id}',                     [PlaceController::class, 'show']);
Route::get('/places/{id}/reviews',             [PlaceController::class, 'reviews']);
Route::get('/places/{id}/ratings-summary',     [PlaceController::class, 'ratingsSummary']);
Route::get('/places/{id}/crowd-status',        [PlaceController::class, 'crowdStatus']);

// Public Reviews (home page testimonials)
Route::get('/reviews',            [ReviewController::class, 'all']);
Route::get('/reviews/{placeId}',  [ReviewController::class, 'index']);

// Public Transports
Route::get('/transports',         [TransportController::class, 'index']);
Route::get('/transports/{id}',    [TransportController::class, 'show']);
Route::get('/transports/{id}/availability', [TransportController::class, 'availability']);

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHENTICATED ROUTES (any logged-in user)
═══════════════════════════════════════════════════════════════════════════ */

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);
    Route::put('/user',    [UserController::class, 'update']);
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])->middleware(['throttle:6,1']);

    // ── Bookings ──────────────────────────────────────────────────────────
    Route::get('/bookings',                 [BookingController::class, 'index']);
    Route::post('/bookings',                [BookingController::class, 'store']);
    Route::get('/bookings/{id}',            [BookingController::class, 'show']);
    Route::put('/bookings/{id}',            [BookingController::class, 'update']);
    Route::delete('/bookings/{id}',         [BookingController::class, 'destroy']);
    Route::get('/bookings/{id}/receipt',    [BookingController::class, 'receipt']);
    Route::post('/bookings/{id}/confirm',   [BookingController::class, 'confirm']);
    Route::post('/bookings/{id}/cancel',    [BookingController::class, 'cancel']);

    // ── Transport Booking ─────────────────────────────────────────────────
    Route::post('/bookings/transport',      [TransportController::class, 'bookTransport']);

    // ── Reviews ───────────────────────────────────────────────────────────
    Route::post('/reviews',                 [ReviewController::class, 'store']);
    Route::put('/reviews/{id}',             [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}',          [ReviewController::class, 'destroy']);

    // ── Favorites / Saved Places ──────────────────────────────────────────
    Route::get('/favorites',                [FavoriteController::class, 'index']);
    Route::post('/favorites',               [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}',        [FavoriteController::class, 'destroy']);

    // ── AI Services ───────────────────────────────────────────────────────
    Route::prefix('ai')->group(function () {
        Route::post('/chat',            [AIServiceController::class, 'chat']);
        Route::post('/recommend',       [AIServiceController::class, 'recommend']);
        Route::post('/crowd-predict',   [AIServiceController::class, 'crowdPredict']);
        Route::post('/sentiment',       [AIServiceController::class, 'sentiment']);
    });

    // ── Agency/Admin: Places CRUD ─────────────────────────────────────────
    Route::post('/places',              [PlaceController::class, 'store']);
    Route::put('/places/{id}',          [PlaceController::class, 'update']);
    Route::delete('/places/{id}',       [PlaceController::class, 'destroy']);

    // ── Agency/Admin: Transports CRUD ─────────────────────────────────────
    Route::post('/transports',          [TransportController::class, 'store']);
    Route::put('/transports/{id}',      [TransportController::class, 'update']);
    Route::patch('/transports/{id}/load', [TransportController::class, 'updateLoad']);

    // ── Admin-only ────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                        [UserController::class, 'adminStats']);
        Route::get('/users',                        [UserController::class, 'listUsers']);
        Route::get('/users/{id}',                   [UserController::class, 'showUser']);
        Route::post('/users/{id}/deactivate',       [UserController::class, 'deactivateUser']);
        Route::post('/users/{id}/activate',         [UserController::class, 'activateUser']);
    });
});
