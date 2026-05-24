<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('agency.{agencyId}', function ($user, $agencyId) {
    return (int) $user->id === (int) $agencyId
        && $user->role === 'agency'
        && $user->approval_status === 'approved';
});
