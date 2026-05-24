<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:admin') or ->middleware('role:agency,authority')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        if ($user->role === 'agency' && ($user->approval_status !== 'approved' || $user->deactivated_at)) {
            return response()->json([
                'message' => 'Your travel agency account requires City Authority approval.',
            ], 403);
        }

        return $next($request);
    }
}
