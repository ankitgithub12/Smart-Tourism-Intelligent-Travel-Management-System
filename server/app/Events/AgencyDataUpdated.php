<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgencyDataUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    public function __construct(public int $agencyId, array $data)
    {
        $this->data = $data;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('agency.' . $this->agencyId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'AgencyDataUpdated';
    }

    public function broadcastWith(): array
    {
        return $this->data;
    }
}
