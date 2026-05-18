<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * PUT /api/user — update authenticated user's own profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => "sometimes|email|unique:users,email,{$user->id}",
            'password' => 'sometimes|string|min:8|confirmed',
            'avatar'   => 'sometimes|string|url',
        ]);

        $data = $request->only(['name', 'email', 'avatar']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['user' => $user->fresh(), 'message' => 'Profile updated successfully.']);
    }

    /* ─── Admin-only endpoints ─────────────────────────────────────────── */

    /**
     * GET /api/admin/users — list all users with filters
     */
    public function listUsers(Request $request)
    {
        $this->requireAdmin($request);

        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('q')) {
            $q = '%' . $request->q . '%';
            $query->where(fn($qb) => $qb->where('name', 'like', $q)->orWhere('email', 'like', $q));
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->whereNull('deactivated_at');
            } else {
                $query->whereNotNull('deactivated_at');
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    /**
     * GET /api/admin/users/{id} — view user details + activity summary
     */
    public function showUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);

        $bookingsCount = DB::table('bookings')->where('user_id', $id)->count();
        $reviewsCount  = DB::table('reviews')->where('user_id', $id)->count();
        $favoritesCount = DB::table('user_favorites')->where('user_id', $id)->count();

        return response()->json([
            'user'           => $user,
            'bookings_count' => $bookingsCount,
            'reviews_count'  => $reviewsCount,
            'favorites_count'=> $favoritesCount,
        ]);
    }

    /**
     * POST /api/admin/users/{id}/deactivate
     */
    public function deactivateUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        $user->update(['deactivated_at' => now()]);
        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json(['message' => "User '{$user->name}' has been deactivated."]);
    }

    /**
     * POST /api/admin/users/{id}/activate
     */
    public function activateUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['deactivated_at' => null]);

        return response()->json(['message' => "User '{$user->name}' has been activated."]);
    }

    /**
     * GET /api/admin/stats — real system-wide statistics
     */
    public function adminStats(Request $request)
    {
        $this->requireAdmin($request);

        $totalUsers     = DB::table('users')->count();
        $totalPlaces    = DB::table('tourist_places')->whereNull('deleted_at')->count();
        $totalBookings  = DB::table('bookings')->count();
        $totalRevenue   = DB::table('bookings')->whereIn('payment_status', ['paid'])->sum('total_price');
        $pendingBookings= DB::table('bookings')->where('status', 'pending')->count();
        $totalTransports= DB::table('transports')->count();
        $totalReviews   = DB::table('reviews')->count();

        $usersByRole    = DB::table('users')->select('role', DB::raw('count(*) as count'))->groupBy('role')->get();
        $bookingsByStatus = DB::table('bookings')->select('status', DB::raw('count(*) as count'))->groupBy('status')->get();

        // Recent bookings for activity log
        $recentBookings = DB::table('bookings')
            ->join('users', 'bookings.user_id', '=', 'users.id')
            ->join('tourist_places', 'bookings.tourist_place_id', '=', 'tourist_places.id')
            ->select('bookings.id', 'bookings.status', 'bookings.created_at', 'users.name as user_name', 'tourist_places.name as place_name')
            ->orderBy('bookings.created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => [
                'total_users'      => $totalUsers,
                'total_places'     => $totalPlaces,
                'total_bookings'   => $totalBookings,
                'total_revenue'    => (float) $totalRevenue,
                'pending_bookings' => $pendingBookings,
                'total_transports' => $totalTransports,
                'total_reviews'    => $totalReviews,
            ],
            'users_by_role'        => $usersByRole,
            'bookings_by_status'   => $bookingsByStatus,
            'recent_bookings'      => $recentBookings,
        ]);
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private function requireAdmin(Request $request): void
    {
        if ($request->user()?->role !== 'authority') {
            abort(403, 'Admin access required.');
        }
    }
}
