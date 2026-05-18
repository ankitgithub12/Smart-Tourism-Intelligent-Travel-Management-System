<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     * Logs POST, PUT, PATCH, DELETE requests for admin/agency users.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $user = $request->user();
            
            // Only log actions for authority and agency roles
            if ($user && in_array($user->role, ['authority', 'agency'])) {
                $path = $request->path();
                $action = $request->method() . ' ' . $path;
                
                // Exclude sensitive data from details like passwords
                $details = $request->except(['password', 'password_confirmation', 'image']);
                
                DB::table('activity_logs')->insert([
                    'user_id' => $user->id,
                    'action' => $action,
                    'entity_type' => explode('/', ltrim($path, 'api/'))[0] ?? null,
                    'entity_id' => $request->route('id'),
                    'details' => json_encode($details),
                    'ip_address' => $request->ip(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $response;
    }
}
