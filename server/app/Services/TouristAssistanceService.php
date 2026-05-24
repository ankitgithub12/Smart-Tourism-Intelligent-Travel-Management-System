<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class TouristAssistanceService
{
    public function getAssistance(string $destination, ?string $origin = null, bool $refresh = false): array
    {
        $cacheKey = 'tourist-assistance:' . md5(strtolower(trim($destination) . '|' . trim($origin ?? '')));

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, now()->addMinutes(3), function () use ($destination, $origin) {
            $googleKey = config('services.google_maps.key');

            if (filled($googleKey)) {
                $googleData = $this->googleAssistance($destination, $origin, $googleKey);
                if ($googleData) {
                    return $googleData;
                }
            }

            return $this->openStreetMapAssistance($destination, $origin);
        });
    }

    private function googleAssistance(string $destination, ?string $origin, string $key): ?array
    {
        $destinationPoint = $this->googleGeocode($destination, $key);
        if (!$destinationPoint) {
            return null;
        }

        $originPoint = $origin ? $this->googleGeocode($origin, $key) : null;
        $services = [];
        foreach (['hospitals' => 'hospital', 'atms' => 'atm', 'restaurants' => 'restaurant'] as $group => $type) {
            $services[$group] = $this->googleNearby($destinationPoint, $type, $key);
        }

        return [
            'destination' => $destination,
            'location' => $destinationPoint,
            'updated_at' => now()->toIso8601String(),
            'source' => [
                'services' => 'Google Places',
                'route' => 'Google Routes',
                'traffic' => $originPoint ? 'Google live traffic' : null,
            ],
            'services' => $services,
            'route' => $originPoint ? $this->googleRoute($originPoint, $destinationPoint, $origin, $destination, $key) : null,
        ];
    }

    private function googleGeocode(string $address, string $key): ?array
    {
        try {
            $response = Http::timeout(8)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address,
                'key' => $key,
            ]);

            $result = data_get($response->json(), 'results.0');
            if (!$response->successful() || !$result) {
                return null;
            }

            return [
                'label' => data_get($result, 'formatted_address', $address),
                'lat' => (float) data_get($result, 'geometry.location.lat'),
                'lon' => (float) data_get($result, 'geometry.location.lng'),
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function googleNearby(array $center, string $type, string $key): array
    {
        try {
            $response = Http::timeout(8)
                ->withHeaders([
                    'X-Goog-Api-Key' => $key,
                    'X-Goog-FieldMask' => 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.businessStatus',
                ])
                ->post('https://places.googleapis.com/v1/places:searchNearby', [
                    'includedTypes' => [$type],
                    'maxResultCount' => 4,
                    'rankPreference' => 'DISTANCE',
                    'locationRestriction' => [
                        'circle' => [
                            'center' => [
                                'latitude' => $center['lat'],
                                'longitude' => $center['lon'],
                            ],
                            'radius' => 5000.0,
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                return [];
            }

            return collect(data_get($response->json(), 'places', []))
                ->map(fn (array $place) => $this->mapGooglePlace($place, $center, $type))
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    private function mapGooglePlace(array $place, array $center, string $type): array
    {
        $lat = (float) data_get($place, 'location.latitude');
        $lon = (float) data_get($place, 'location.longitude');
        $rating = data_get($place, 'rating');
        $operational = data_get($place, 'businessStatus') === 'OPERATIONAL';

        return [
            'id' => data_get($place, 'id'),
            'name' => data_get($place, 'displayName.text', 'Nearby service'),
            'address' => data_get($place, 'formattedAddress'),
            'distance' => $this->formatDistance($this->distanceKm($center['lat'], $center['lon'], $lat, $lon)),
            'phone' => data_get($place, 'nationalPhoneNumber'),
            'status' => $type === 'restaurant' && $rating ? $rating . ' rating' : ($operational ? 'Operational' : null),
            'lat' => $lat,
            'lon' => $lon,
        ];
    }

    private function googleRoute(array $origin, array $destination, ?string $originName, string $destinationName, string $key): ?array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-Goog-Api-Key' => $key,
                    'X-Goog-FieldMask' => 'routes.duration,routes.staticDuration,routes.distanceMeters',
                ])
                ->post('https://routes.googleapis.com/directions/v2:computeRoutes', [
                    'origin' => ['location' => ['latLng' => ['latitude' => $origin['lat'], 'longitude' => $origin['lon']]]],
                    'destination' => ['location' => ['latLng' => ['latitude' => $destination['lat'], 'longitude' => $destination['lon']]]],
                    'travelMode' => 'DRIVE',
                    'routingPreference' => 'TRAFFIC_AWARE',
                    'languageCode' => 'en-IN',
                    'units' => 'METRIC',
                ]);

            $route = data_get($response->json(), 'routes.0');
            if (!$response->successful() || !$route) {
                return null;
            }

            $durationSeconds = $this->durationSeconds(data_get($route, 'duration'));
            $staticSeconds = $this->durationSeconds(data_get($route, 'staticDuration'));
            $delaySeconds = max(0, $durationSeconds - $staticSeconds);

            return [
                'path' => trim(($originName ?: $origin['label']) . ' to ' . $destinationName),
                'distance' => $this->formatDistance(((int) data_get($route, 'distanceMeters')) / 1000),
                'duration' => $this->formatDuration($durationSeconds),
                'traffic' => [
                    'available' => true,
                    'delay_minutes' => (int) round($delaySeconds / 60),
                    'message' => $delaySeconds >= 300
                        ? $this->formatDuration($delaySeconds) . ' added by current traffic'
                        : 'No significant traffic delay detected',
                ],
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function openStreetMapAssistance(string $destination, ?string $origin): array
    {
        $destinationPoint = $this->osmGeocode($destination);
        $originPoint = $origin ? $this->osmGeocode($origin) : null;

        if (!$destinationPoint) {
            return [
                'destination' => $destination,
                'location' => null,
                'updated_at' => now()->toIso8601String(),
                'source' => ['services' => 'OpenStreetMap', 'route' => 'OSRM', 'traffic' => null],
                'services' => ['hospitals' => [], 'atms' => [], 'restaurants' => []],
                'route' => null,
            ];
        }

        return [
            'destination' => $destination,
            'location' => $destinationPoint,
            'updated_at' => now()->toIso8601String(),
            'source' => ['services' => 'OpenStreetMap', 'route' => 'OSRM', 'traffic' => null],
            'services' => $this->osmNearby($destinationPoint),
            'route' => $originPoint ? $this->osmRoute($originPoint, $destinationPoint, $origin, $destination) : null,
        ];
    }

    private function osmGeocode(string $address): ?array
    {
        try {
            $response = Http::timeout(8)
                ->withHeaders(['User-Agent' => config('app.name', 'Smart Tourism') . '/1.0'])
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $address,
                    'format' => 'jsonv2',
                    'limit' => 1,
                ]);

            $result = data_get($response->json(), '0');
            if (!$response->successful() || !$result) {
                return null;
            }

            return [
                'label' => data_get($result, 'display_name', $address),
                'lat' => (float) data_get($result, 'lat'),
                'lon' => (float) data_get($result, 'lon'),
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function osmNearby(array $center): array
    {
        $query = sprintf(
            '[out:json][timeout:10];(nwr["amenity"~"hospital|atm|restaurant"](around:5000,%s,%s););out center tags 30;',
            $center['lat'],
            $center['lon']
        );

        $empty = ['hospitals' => [], 'atms' => [], 'restaurants' => []];

        try {
            $response = Http::timeout(12)
                ->asForm()
                ->post('https://overpass-api.de/api/interpreter', ['data' => $query]);

            if (!$response->successful()) {
                return $empty;
            }

            return collect(data_get($response->json(), 'elements', []))
                ->map(function (array $item) use ($center) {
                    $tags = $item['tags'] ?? [];
                    $amenity = $tags['amenity'] ?? null;
                    $lat = (float) ($item['lat'] ?? data_get($item, 'center.lat'));
                    $lon = (float) ($item['lon'] ?? data_get($item, 'center.lon'));

                    if (!$amenity || !$lat || !$lon) {
                        return null;
                    }

                    return [
                        'group' => match ($amenity) {
                            'hospital' => 'hospitals',
                            'atm' => 'atms',
                            default => 'restaurants',
                        },
                        'id' => data_get($item, 'id'),
                        'name' => $tags['name'] ?? ucfirst($amenity),
                        'distance' => $this->formatDistance($this->distanceKm($center['lat'], $center['lon'], $lat, $lon)),
                        'phone' => $tags['phone'] ?? $tags['contact:phone'] ?? null,
                        'status' => $tags['opening_hours'] ?? null,
                        'lat' => $lat,
                        'lon' => $lon,
                    ];
                })
                ->filter()
                ->sortBy(fn (array $place) => $this->distanceKm($center['lat'], $center['lon'], $place['lat'], $place['lon']))
                ->groupBy('group')
                ->map(fn ($items) => $items->map(fn (array $item) => collect($item)->except('group')->all())->take(4)->values()->all())
                ->all() + $empty;
        } catch (\Throwable) {
            return $empty;
        }
    }

    private function osmRoute(array $origin, array $destination, ?string $originName, string $destinationName): ?array
    {
        try {
            $coordinates = $origin['lon'] . ',' . $origin['lat'] . ';' . $destination['lon'] . ',' . $destination['lat'];
            $response = Http::timeout(10)->get("https://router.project-osrm.org/route/v1/driving/{$coordinates}", [
                'overview' => 'false',
                'steps' => 'false',
            ]);

            $route = data_get($response->json(), 'routes.0');
            if (!$response->successful() || !$route) {
                return null;
            }

            return [
                'path' => trim(($originName ?: $origin['label']) . ' to ' . $destinationName),
                'distance' => $this->formatDistance(((float) data_get($route, 'distance')) / 1000),
                'duration' => $this->formatDuration((int) round(data_get($route, 'duration'))),
                'traffic' => [
                    'available' => false,
                    'delay_minutes' => null,
                    'message' => 'Live traffic requires a configured Google Maps Routes API key',
                ],
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function durationSeconds(?string $duration): int
    {
        return (int) round((float) rtrim((string) $duration, 's'));
    }

    private function formatDuration(int $seconds): string
    {
        $minutes = max(1, (int) round($seconds / 60));
        $hours = intdiv($minutes, 60);
        $remaining = $minutes % 60;

        return $hours ? "{$hours} hr {$remaining} min" : "{$minutes} min";
    }

    private function formatDistance(float $kilometers): string
    {
        if ($kilometers < 1) {
            return max(1, (int) round($kilometers * 1000)) . ' m';
        }

        return number_format($kilometers, $kilometers < 10 ? 1 : 0) . ' km';
    }

    private function distanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lonDelta / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
