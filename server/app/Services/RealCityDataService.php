<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class RealCityDataService
{
    public function snapshot(): array
    {
        $city = config('services.real_city.city', 'Jaipur');
        $country = config('services.real_city.country', 'IN');
        $lat = (float) config('services.real_city.lat', 26.9124);
        $lon = (float) config('services.real_city.lon', 75.7873);
        $radius = (int) config('services.real_city.radius_meters', 6000);

        return Cache::remember(
            "real-city:snapshot:{$city}:{$lat}:{$lon}:{$radius}",
            now()->addMinutes(15),
            fn () => [
                'city' => $city,
                'country' => $country,
                'coordinates' => ['lat' => $lat, 'lon' => $lon],
                'generatedAt' => now()->toIso8601String(),
                'weather' => $this->weather($lat, $lon),
                'airQuality' => $this->airQuality($lat, $lon),
                'touristPlaces' => $this->touristPlaces($lat, $lon, $radius),
                'sources' => [
                    'weather' => filled(config('services.openweather.key')) ? 'OpenWeather' : null,
                    'airQuality' => filled(config('services.openweather.key')) ? 'OpenWeather Air Pollution API' : null,
                    'touristPlaces' => 'OpenStreetMap Overpass API',
                ],
            ]
        );
    }

    public function crowdZonesFromPlaces(array $cityData): array
    {
        $places = collect($cityData['touristPlaces'] ?? [])->take(5)->values();

        if ($places->isEmpty()) {
            return [];
        }

        $temp = data_get($cityData, 'weather.temperature');
        $aqi = data_get($cityData, 'airQuality.aqi');
        $hour = (int) now()->format('G');

        return $places->map(function (array $place, int $index) use ($temp, $aqi, $hour) {
            $density = 34 + ($index * 7);

            if ($hour >= 10 && $hour <= 18) {
                $density += 12;
            }

            if (is_numeric($temp) && $temp > 34) {
                $density -= 8;
            }

            if (is_numeric($aqi) && $aqi >= 4) {
                $density -= 6;
            }

            $density = max(12, min(92, $density));

            return [
                'id' => 'real-' . ($index + 1),
                'name' => $place['name'],
                'density' => $density,
                'visitors' => null,
                'status' => $this->densityStatus($density),
                'source' => 'OpenStreetMap + weather-adjusted estimate',
                'lat' => $place['lat'] ?? null,
                'lon' => $place['lon'] ?? null,
                'category' => $place['category'] ?? 'tourism',
            ];
        })->all();
    }

    private function weather(float $lat, float $lon): ?array
    {
        $key = config('services.openweather.key');
        if (blank($key)) {
            return null;
        }

        try {
            $res = Http::timeout(8)->get('https://api.openweathermap.org/data/2.5/weather', [
                'lat' => $lat,
                'lon' => $lon,
                'appid' => $key,
                'units' => 'metric',
            ]);

            if (!$res->successful()) {
                return null;
            }

            $json = $res->json();

            return [
                'temperature' => data_get($json, 'main.temp'),
                'feelsLike' => data_get($json, 'main.feels_like'),
                'humidity' => data_get($json, 'main.humidity'),
                'windSpeed' => data_get($json, 'wind.speed'),
                'condition' => data_get($json, 'weather.0.main'),
                'description' => data_get($json, 'weather.0.description'),
                'observedAt' => data_get($json, 'dt') ? date('c', data_get($json, 'dt')) : null,
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function airQuality(float $lat, float $lon): ?array
    {
        $key = config('services.openweather.key');
        if (blank($key)) {
            return null;
        }

        try {
            $res = Http::timeout(8)->get('https://api.openweathermap.org/data/2.5/air_pollution', [
                'lat' => $lat,
                'lon' => $lon,
                'appid' => $key,
            ]);

            if (!$res->successful()) {
                return null;
            }

            $item = data_get($res->json(), 'list.0');
            $aqi = data_get($item, 'main.aqi');

            return [
                'aqi' => $aqi,
                'label' => match ((int) $aqi) {
                    1 => 'Good',
                    2 => 'Fair',
                    3 => 'Moderate',
                    4 => 'Poor',
                    5 => 'Very Poor',
                    default => 'Unknown',
                },
                'pm25' => data_get($item, 'components.pm2_5'),
                'pm10' => data_get($item, 'components.pm10'),
                'observedAt' => data_get($item, 'dt') ? date('c', data_get($item, 'dt')) : null,
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    private function touristPlaces(float $lat, float $lon, int $radius): array
    {
        $query = <<<OVERPASS
[out:json][timeout:8];
(
  node["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery"](around:$radius,$lat,$lon);
  way["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery"](around:$radius,$lat,$lon);
  relation["tourism"~"attraction|museum|viewpoint|zoo|theme_park|gallery"](around:$radius,$lat,$lon);
);
out center tags 25;
OVERPASS;

        try {
            $res = Http::timeout(12)
                ->asForm()
                ->post('https://overpass-api.de/api/interpreter', ['data' => $query]);

            if (!$res->successful()) {
                return [];
            }

            return collect(data_get($res->json(), 'elements', []))
                ->map(function (array $item) {
                    $tags = $item['tags'] ?? [];
                    $name = $tags['name'] ?? null;
                    if (!$name) {
                        return null;
                    }

                    return [
                        'id' => data_get($item, 'id'),
                        'name' => $name,
                        'category' => $tags['tourism'] ?? 'tourism',
                        'lat' => $item['lat'] ?? data_get($item, 'center.lat'),
                        'lon' => $item['lon'] ?? data_get($item, 'center.lon'),
                    ];
                })
                ->filter(fn ($item) => $item && $item['lat'] && $item['lon'])
                ->unique('name')
                ->values()
                ->all();
        } catch (\Throwable) {
            return [];
        }
    }

    private function densityStatus(int $density): string
    {
        if ($density >= 75) return 'Critical';
        if ($density >= 55) return 'High';
        if ($density >= 30) return 'Moderate';

        return 'Low';
    }
}
