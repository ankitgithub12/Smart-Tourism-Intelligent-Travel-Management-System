<?php

namespace App\Http\Controllers;

use App\Services\TouristAssistanceService;
use Illuminate\Http\Request;

class TouristAssistanceController extends Controller
{
    public function show(Request $request, TouristAssistanceService $assistanceService)
    {
        if ($request->has('refresh')) {
            $request->merge(['refresh' => $request->boolean('refresh')]);
        }

        $validated = $request->validate([
            'destination' => 'required|string|max:150',
            'origin' => 'nullable|string|max:150',
            'refresh' => 'nullable|boolean',
        ]);

        return response()->json($assistanceService->getAssistance(
            $validated['destination'],
            $validated['origin'] ?? null,
            (bool) ($validated['refresh'] ?? false)
        ));
    }
}
