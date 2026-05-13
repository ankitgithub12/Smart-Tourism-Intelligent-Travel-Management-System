<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransportController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('transports')->get());
    }

    public function updateLoad(Request $request, $id)
    {
        $request->validate(['current_load' => 'required|integer']);
        
        DB::table('transports')
            ->where('id', $id)
            ->update([
                'current_load' => $request->current_load,
                'updated_at' => now()
            ]);

        return response()->json(['message' => 'Transport load updated']);
    }
}
