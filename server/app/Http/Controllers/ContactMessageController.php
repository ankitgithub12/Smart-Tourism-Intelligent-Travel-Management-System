<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        if (! $user && $request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            $user = $token?->tokenable;
        }
        $senderRole = $user?->role ?? 'guest';
        $recipientRole = $senderRole === 'agency' ? 'authority' : 'agency';

        $message = ContactMessage::create([
            ...$validated,
            'sender_id' => $user?->id,
            'sender_role' => $senderRole,
            'recipient_role' => $recipientRole,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'contact_message' => $message,
        ], 201);
    }
}
