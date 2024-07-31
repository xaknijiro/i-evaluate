<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationFormController;
use App\Http\Controllers\EvaluationFormCriterionController;
use App\Http\Controllers\EvaluationScheduleController;
use App\Http\Controllers\EvaluationScheduleSubjectClassController;
use App\Http\Controllers\StaticPageController;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

/**
 * Auth - Login/out
 */
Route::get('/login', [AuthController::class, 'create'])->name('login');
Route::post('/login', [AuthController::class, 'store']);
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth');

Route::get('/evaluation', [EvaluationController::class, 'index'])->name('evaluation');
Route::post('/evaluation', [EvaluationController::class, 'store']);
Route::get(
    '/evaluation-schedule-subject-class/{evaluationScheduleSubjectClass}/validate',
    [EvaluationScheduleSubjectClassController::class, 'index']
)->name('evaluation-schedule-subject-class-validate');
Route::post(
    '/evaluation-schedule-subject-class/{evaluationScheduleSubjectClass}/validate',
    [EvaluationScheduleSubjectClassController::class, 'validate']
);
Route::get(
    '/evaluation-schedule-subject-class/{evaluationScheduleSubjectClass}',
    [EvaluationScheduleSubjectClassController::class, 'show']
)->name('evaluate-scheduled-subject');
Route::patch(
    '/evaluation-schedule-subject-class/{evaluationScheduleSubjectClass}',
    [EvaluationScheduleSubjectClassController::class, 'update']
);

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::group(['prefix' => '/evaluation-schedules'], static function () {
        Route::get('/', [EvaluationScheduleController::class, 'index']);
    });

    Route::group(['prefix' => '/evaluation-forms'], static function () {
        Route::get('/', [EvaluationFormController::class, 'index']);
        Route::post('/', [EvaluationFormController::class, 'store']);
        Route::get('/{evaluationForm}', [EvaluationFormController::class, 'show']);
        Route::patch('/{evaluationForm}', [EvaluationFormController::class, 'update']);
        Route::delete('/{evaluationForm}', [EvaluationFormController::class, 'destroy']);

        Route::group(['prefix' => '{evaluationForm}/criteria'], static function () {
            Route::post('/', [EvaluationFormCriterionController::class, 'store']);
            Route::patch('/{criterion}', [EvaluationFormCriterionController::class, 'update']);
            Route::delete('/{criterion}', [EvaluationFormCriterionController::class, 'destroy']);
        });
    });

    Route::get('/about', [StaticPageController::class, 'about']);
});

Route::get('/test-email', function () {
    Mail::raw('I-Evaluate test email.', function (Message $msg) {
        $msg
            ->to('regolio.guisdan@kcp.edu.ph')
            ->subject('I-Evaluate Test Email');
    });
});
