<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Trip;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    public function createCheckoutSession(Trip $trip, $successUrl, $cancelUrl)
    {
        $lineItems = [];

        // Add main trip items as line items for Stripe Checkout
        if ($trip->agency_package_id && $trip->agencyPackage) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Package: ' . $trip->agencyPackage->name,
                    ],
                    'unit_amount' => (int) ($trip->agencyPackage->price * 100),
                ],
                'quantity' => max(1, (int) $trip->travelers),
            ];
        }

        if ($trip->hotel_id && $trip->hotel) {
            $nights = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days);
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Hotel: ' . $trip->hotel->name,
                    ],
                    'unit_amount' => (int) ($trip->hotel->price_per_night * 100),
                ],
                'quantity' => $nights,
            ];
        }

        if ($trip->food_package_id && $trip->foodPackage) {
            $days = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days) + 1;
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Food Package: ' . $trip->foodPackage->label,
                    ],
                    'unit_amount' => (int) ($trip->foodPackage->price_per_day * 100),
                ],
                'quantity' => $days * $trip->travelers,
            ];
        }

        if ($trip->cab_service_id && $trip->cabService) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Cab Service: ' . $trip->cabService->label,
                    ],
                    'unit_amount' => (int) ($trip->cabService->price * 100),
                ],
                'quantity' => $trip->travelers,
            ];
        }

        if ($trip->guide_id && $trip->guide) {
            $days = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days) + 1;
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Tour Guide: ' . $trip->guide->name,
                    ],
                    'unit_amount' => (int) ($trip->guide->price_per_day * 100),
                ],
                'quantity' => $days,
            ];
        }

        if ($trip->agency_guide_id && $trip->agencyGuide) {
            $days = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days) + 1;
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Tour Guide: ' . $trip->agencyGuide->name,
                    ],
                    'unit_amount' => 1200 * 100,
                ],
                'quantity' => $days,
            ];
        }

        if ($trip->rental_vehicle_id && $trip->rentalVehicle) {
            $days = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days) + 1;
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Rental Vehicle: ' . $trip->rentalVehicle->type,
                    ],
                    'unit_amount' => (int) ($trip->rentalVehicle->price_per_day * 100),
                ],
                'quantity' => $days,
            ];
        }

        if ($trip->agency_vehicle_id && $trip->agencyVehicle) {
            $days = max(1, (new \DateTime($trip->return_date))->diff(new \DateTime($trip->departure_date))->days) + 1;
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => [
                        'name' => 'Vehicle: ' . $trip->agencyVehicle->model,
                    ],
                    'unit_amount' => 1800 * 100,
                ],
                'quantity' => $days,
            ];
        }

        // Taxes & discounts (handled as single adjustments in this simplified example)
        if ($trip->tax > 0) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => 'inr',
                    'product_data' => ['name' => 'Taxes & Fees'],
                    'unit_amount' => (int) ($trip->tax * 100),
                ],
                'quantity' => 1,
            ];
        }
        
        // Note: Stripe doesn't directly support negative line items for discount
        // You'd typically create a coupon on Stripe or apply discount to subtotal
        // We will just create the checkout session using the line items array

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}&trip_id=' . $trip->id,
            'cancel_url' => $cancelUrl . '?trip_id=' . $trip->id,
            'metadata' => [
                'trip_id' => $trip->id,
                'user_id' => $trip->user_id,
            ]
        ]);

        return $session;
    }
}
