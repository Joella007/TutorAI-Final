<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CycleResource;
use App\Models\Cycle;
use Illuminate\Http\Request;

class CycleController extends Controller
{
    public function index()
    {
        return CycleResource::collection(Cycle::all());
    }
}
