<?php

namespace App\Http\Controllers;

use App\Services\EvaluationScheduleService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected EvaluationScheduleService $evaluationScheduleService,
    ) {}

    public function index()
    {
        $latestEvaluationSchedule = $this->evaluationScheduleService->getLatestEvaluationSchedule();

        return Inertia::render('Dashboard/Index', [
            'latestEvaluationSchedule' => $latestEvaluationSchedule,
        ]);
    }
}
