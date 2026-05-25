<?php

namespace App\Models;

use App\Events\NotificationSent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'category',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a notification only if a duplicate (same user, title, message, type)
     * was not created in the last 15 seconds. Also broadcasts the event.
     */
    public static function createUnique(int $userId, string $title, string $message, string $type = 'info', string $category = 'update'): ?self
    {
        $exists = static::where('user_id', $userId)
            ->where('title', $title)
            ->where('message', $message)
            ->where('type', $type)
            ->where('created_at', '>=', now()->subSeconds(15))
            ->exists();

        if ($exists) {
            return null;
        }

        $notification = static::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'category' => $category,
        ]);

        event(new NotificationSent($userId, $message, $type, [
            'notification_id' => $notification->id,
            'title' => $title,
            'category' => $category,
        ]));

        return $notification;
    }
}
