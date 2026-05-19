<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Payment;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Webhook;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function createCheckoutSession(Request $request)
    {
        $request->validate(['trip_id' => 'required|exists:trips,id']);
        
        $trip = Trip::where('id', $request->trip_id)
                    ->where('user_id', $request->user()->id)
                    ->firstOrFail();

        $successUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/payment/success';
        $cancelUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/payment/cancel';

        try {
            $session = $this->stripeService->createCheckoutSession($trip, $successUrl, $cancelUrl);

            // Record pending payment
            Payment::updateOrCreate(
                ['trip_id' => $trip->id, 'user_id' => $trip->user_id],
                [
                    'stripe_session_id' => $session->id,
                    'amount' => $trip->total_price,
                    'currency' => 'inr',
                    'status' => 'pending',
                ]
            );

            return response()->json(['url' => $session->url]);

        } catch (\Exception $e) {
            Log::error('Stripe Checkout Error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to create payment session'], 500);
        }
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch(\UnexpectedValueException $e) {
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch(\Stripe\Exception\SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type == 'checkout.session.completed') {
            $session = $event->data->object;

            $tripId = $session->metadata->trip_id;
            $payment = Payment::where('stripe_session_id', $session->id)->first();

            if ($payment) {
                $payment->status = 'paid';
                $payment->stripe_payment_id = $session->payment_intent;
                $payment->save();

                $trip = Trip::find($tripId);
                if ($trip) {
                    $trip->status = 'confirmed';
                    $trip->save();
                }
            }
        }

        return response()->json(['status' => 'success'], 200);
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'trip_id' => 'required|integer',
        ]);

        try {
            Stripe::setApiKey(env('STRIPE_SECRET'));
            $session = \Stripe\Checkout\Session::retrieve($request->session_id);

            if ($session && ($session->payment_status === 'paid' || $session->status === 'complete')) {
                $payment = Payment::where('stripe_session_id', $session->id)->first();
                if ($payment) {
                    $payment->status = 'paid';
                    $payment->stripe_payment_id = $session->payment_intent;
                    $payment->save();
                } else {
                    Payment::create([
                        'trip_id' => $request->trip_id,
                        'user_id' => $request->user()->id,
                        'stripe_session_id' => $session->id,
                        'stripe_payment_id' => $session->payment_intent,
                        'amount' => $session->amount_total / 100,
                        'currency' => $session->currency,
                        'status' => 'paid',
                    ]);
                }

                $trip = Trip::where('id', $request->trip_id)
                            ->where('user_id', $request->user()->id)
                            ->first();
                if ($trip) {
                    $trip->status = 'confirmed';
                    $trip->save();
                }

                return response()->json(['status' => 'success', 'message' => 'Payment confirmed successfully.']);
            }

            return response()->json(['status' => 'pending', 'message' => 'Payment is not completed yet.'], 400);

        } catch (\Exception $e) {
            Log::error('Payment Confirmation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to confirm payment status: ' . $e->getMessage()], 500);
        }
    }
}
