<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        request()->user()?->tokens()->delete();

        return array_merge(parent::share($request), [
            'appName' => 'I-Evaluate',
            'auth' => Auth::user() ? [
                'id' => Auth::user()->id,
                'email' => Auth::user()->email,
                'name' => Auth::user()->name,
                'roles' => Auth::user()->roles->pluck('name'),
                'token' => request()->user()?->createToken('i-evaluate')->plainTextToken,
            ] : null,
            'flashMessage' => $request->session()->get('i-evaluate-flash-message'),
        ]);
    }
}
