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
use App\Http\Controllers\API\TripController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\AgencyDashboardController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\TouristAssistanceController;
use App\Http\Controllers\NotificationController;

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
Route::get('/packages',           [ListingController::class, 'packages']);
Route::get('/hotels',             [ListingController::class, 'hotels']);
Route::get('/trip-options',       [TripController::class, 'options']);
Route::post('/contact',           [ContactMessageController::class, 'store']);

// Public Transports
Route::get('/transports',         [TransportController::class, 'index']);
Route::get('/transports/{id}',    [TransportController::class, 'show']);
Route::get('/transports/{id}/availability', [TransportController::class, 'availability']);

// Stripe Webhook (must not have auth/CSRF middleware)
Route::post('/stripe/webhook',    [PaymentController::class, 'webhook']);

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
    Route::post('/bookings',                [BookingController::class, 'store'])->middleware('role:tourist');
    Route::get('/bookings/{id}',            [BookingController::class, 'show']);
    Route::put('/bookings/{id}',            [BookingController::class, 'update'])->middleware('role:tourist');
    Route::delete('/bookings/{id}',         [BookingController::class, 'destroy'])->middleware('role:tourist,authority');
    Route::get('/bookings/{id}/receipt',    [BookingController::class, 'receipt'])->middleware('role:tourist');
    Route::post('/bookings/{id}/confirm',   [BookingController::class, 'confirm']);
    Route::post('/bookings/{id}/cancel',    [BookingController::class, 'cancel'])->middleware('role:tourist,authority');

    // ── Trips (Smart Planner) ─────────────────────────────────────────────
    Route::get('/trips',                    [TripController::class, 'index'])->middleware('role:tourist');
    Route::post('/trips',                   [TripController::class, 'store'])->middleware('role:tourist');
    Route::get('/trips/{tripId}',           [TripController::class, 'show'])->middleware('role:tourist');
    Route::post('/trips/{tripId}/cancel',   [TripController::class, 'cancel'])->middleware('role:tourist');
    Route::post('/trips/{tripId}/rate',     [TripController::class, 'rate'])->middleware('role:tourist');
    Route::post('/trips/checkout',          [PaymentController::class, 'createCheckoutSession'])->middleware('role:tourist');
    Route::post('/payment/confirm',         [PaymentController::class, 'confirmPayment'])->middleware('role:tourist');

    // ── Notifications ─────────────────────────────────────────────────────
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::post('/notifications',             [NotificationController::class, 'store']);
    Route::patch('/notifications/{id}/read',  [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications',           [NotificationController::class, 'clearAll']);

    // ── Profile Stats ─────────────────────────────────────────────────────
    Route::get('/user/profile-stats',         [UserController::class, 'profileStats']);

    // ── Transport Booking ─────────────────────────────────────────────────
    Route::post('/bookings/transport',      [TransportController::class, 'bookTransport'])->middleware('role:tourist');

    // ── Reviews ───────────────────────────────────────────────────────────
    Route::post('/reviews',                 [ReviewController::class, 'store'])->middleware('role:tourist');
    Route::put('/reviews/{id}',             [ReviewController::class, 'update'])->middleware('role:tourist');
    Route::delete('/reviews/{id}',          [ReviewController::class, 'destroy'])->middleware('role:tourist,authority');

    // ── Favorites / Saved Places ──────────────────────────────────────────
    Route::get('/favorites',                [FavoriteController::class, 'index'])->middleware('role:tourist');
    Route::post('/favorites',               [FavoriteController::class, 'store'])->middleware('role:tourist');
    Route::delete('/favorites/{id}',        [FavoriteController::class, 'destroy'])->middleware('role:tourist');
    Route::get('/tourist/assistance',        [TouristAssistanceController::class, 'show'])->middleware('role:tourist');

    // ── AI Services ───────────────────────────────────────────────────────
    Route::prefix('ai')->group(function () {
        Route::post('/chat',            [AIServiceController::class, 'chat']);
        Route::post('/recommend',       [AIServiceController::class, 'recommend']);
        Route::post('/crowd-predict',   [AIServiceController::class, 'crowdPredict']);
        Route::post('/sentiment',       [AIServiceController::class, 'sentiment']);
    });

    // ── Agency/Admin: Places CRUD ─────────────────────────────────────────
    Route::post('/places',              [PlaceController::class, 'store'])->middleware('role:agency,authority');
    Route::put('/places/{id}',          [PlaceController::class, 'update'])->middleware('role:agency,authority');
    Route::delete('/places/{id}',       [PlaceController::class, 'destroy'])->middleware('role:agency,authority');

    // ── Agency/Admin: Transports CRUD ─────────────────────────────────────
    Route::post('/transports',          [TransportController::class, 'store'])->middleware('role:agency,authority');
    Route::put('/transports/{id}',      [TransportController::class, 'update'])->middleware('role:agency,authority');
    Route::patch('/transports/{id}/load', [TransportController::class, 'updateLoad'])->middleware('role:agency,authority');

    // ── Admin-only ────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                        [UserController::class, 'adminStats']);
        Route::get('/users',                        [UserController::class, 'listUsers']);
        Route::get('/users/{id}',                   [UserController::class, 'showUser']);
        Route::post('/users/{id}/deactivate',       [UserController::class, 'deactivateUser']);
        Route::post('/users/{id}/activate',         [UserController::class, 'activateUser']);
        
        // Live Telemetry Command Dashboard routes
        Route::get('/telemetry',                     [TelemetryController::class, 'getTelemetry']);
        Route::post('/telemetry/tick',               [TelemetryController::class, 'tickTelemetry']);
        Route::post('/emergencies/{id}/update-status', [TelemetryController::class, 'updateEmergencyStatus']);
        Route::post('/agencies/{id}/update-status',  [TelemetryController::class, 'updateAgencyApproval']);
    });

    // ── Agency Dashboard routes ───────────────────────────────────────────
    Route::prefix('agency')->group(function () {
        Route::get('/dashboard',                     [AgencyDashboardController::class, 'getDashboard']);
        Route::post('/packages',                     [AgencyDashboardController::class, 'createPackage']);
        Route::delete('/packages/{id}',              [AgencyDashboardController::class, 'deletePackage']);
        Route::post('/hotels',                       [AgencyDashboardController::class, 'createHotel']);
        Route::delete('/hotels/{id}',                [AgencyDashboardController::class, 'deleteHotel']);
        Route::post('/tours',                        [AgencyDashboardController::class, 'createTour']);
        Route::post('/vehicles',                     [AgencyDashboardController::class, 'createVehicle']);
        Route::patch('/vehicles/{id}/status',        [AgencyDashboardController::class, 'updateVehicleStatus']);
        Route::delete('/vehicles/{id}',              [AgencyDashboardController::class, 'deleteVehicle']);
        Route::post('/guides',                       [AgencyDashboardController::class, 'createGuide']);
        Route::patch('/guides/{id}/status',          [AgencyDashboardController::class, 'updateGuideStatus']);
        Route::delete('/guides/{id}',                [AgencyDashboardController::class, 'deleteGuide']);
        Route::patch('/bookings/{id}/status',        [AgencyDashboardController::class, 'updateBookingStatus']);
    });
});
