<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openweather' => [
        'key' => env('OPENWEATHER_API_KEY'),
    ],

    'google_maps' => [
        'key' => env('GOOGLE_MAPS_API_KEY'),
    ],

    'real_city' => [
        'enabled' => env('CITY_DATA_ENABLED', true),
        'city' => env('CITY_DATA_CITY', 'Jaipur'),
        'country' => env('CITY_DATA_COUNTRY', 'IN'),
        'lat' => env('CITY_DATA_LAT', 26.9124),
        'lon' => env('CITY_DATA_LON', 75.7873),
        'radius_meters' => env('CITY_DATA_RADIUS_METERS', 6000),
    ],

];
