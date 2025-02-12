<?php

namespace App\Http\Controllers;

use App\Http\Resources\EvaluatorResource;
use App\Services\EvaluationScheduleService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService,
    ) {}

    public function index()
    {
        $pendingTasksAsEvaluator = $this->evaluationScheduleService->getPendingTasksAsEvaluator(Auth::user());

        request()->merge([
            'with' => [
                'evaluation_schedule',
                'evaluation_type',
                'evaluatee',
            ],
        ]);

        return Inertia::render('Dashboard/Index', [
            'pendingTasksAsEvaluator' => EvaluatorResource::collection($pendingTasksAsEvaluator),
        ]);
    }
}
