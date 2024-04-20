<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function about()
    {
        return Inertia::render('Static/About', []);
    }

    public function dashboard()
    {
        return Inertia::render('Static/Dashboard', []);
    }

    public function evaluate()
    {
        return Inertia::render('Evaluate/Index', []);
    }
}
