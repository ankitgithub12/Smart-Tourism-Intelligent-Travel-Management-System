<?php

namespace App\Http\Controllers;

use App\Models\AgencyPackage;
use App\Models\Hotel;
use App\Models\Trip;

class ListingController extends Controller
{
    public function packages()
    {
        $packageRatings = Trip::query()
            ->whereNotNull('agency_package_id')
            ->whereNotNull('rating')
            ->selectRaw('agency_package_id, ROUND(AVG(rating), 2) as average_rating, COUNT(*) as reviews_count')
            ->groupBy('agency_package_id')
            ->get()
            ->keyBy('agency_package_id');

        $packages = AgencyPackage::query()
            ->where('status', 'Active')
            ->latest()
            ->get()
            ->map(function (AgencyPackage $package) use ($packageRatings) {
                $rating = $packageRatings->get($package->id);

                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'destination' => $package->destination,
                    'duration' => $package->duration,
                    'price' => (float) $package->price,
                    'rating' => $rating ? (float) $rating->average_rating : 0,
                    'reviews' => $rating ? (int) $rating->reviews_count : 0,
                    'image' => $package->image,
                    'includes' => ['Hotel', 'Meals', 'Transport', 'Guide'],
                    'category' => $this->categoryFor($package->destination),
                ];
            });

        return response()->json($packages);
    }

    public function hotels()
    {
        $hotels = Hotel::query()
            ->latest()
            ->get()
            ->map(fn (Hotel $hotel) => [
                'id' => $hotel->id,
                'name' => $hotel->name,
                'location' => $hotel->location,
                'stars' => (int) $hotel->stars,
                'price' => (float) $hotel->price_per_night,
                'rating' => (float) $hotel->rating,
                'reviews' => (int) $hotel->reviews_count,
                'image' => $hotel->image,
                'amenities' => $hotel->amenities ?: [],
            ]);

        return response()->json($hotels);
    }

    private function categoryFor(string $destination): string
    {
        $value = strtolower($destination);

        return match (true) {
            str_contains($value, 'beach') || str_contains($value, 'goa') || str_contains($value, 'andaman') => 'beach',
            str_contains($value, 'mount') || str_contains($value, 'manali') || str_contains($value, 'himalaya') => 'adventure',
            str_contains($value, 'fort') || str_contains($value, 'jaipur') || str_contains($value, 'rajasthan') => 'heritage',
            str_contains($value, 'kerala') || str_contains($value, 'backwater') => 'nature',
            default => 'city',
        };
    }
}
