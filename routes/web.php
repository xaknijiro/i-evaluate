<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationFormController;
use App\Http\Controllers\EvaluationFormCriterionController;
use App\Http\Controllers\EvaluationResultController;
use App\Http\Controllers\EvaluationScheduleController;
use App\Http\Controllers\EvaluationScheduleEvaluateeController;
use App\Http\Controllers\EvaluationScheduleSubjectClassController;
use App\Http\Controllers\EvaluationScheduleSubjectClassRosterController;
use App\Http\Controllers\StaticPageController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UserController;
use App\Models\EvaluationScheduleSubjectClass;
use App\Models\User;
use App\Services\EvaluationResultService;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

/**
 * Auth - Login/out
 */
Route::get('/login', [AuthController::class, 'create'])->name('login');
Route::post('/login', [AuthController::class, 'store']);
Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth');

Route::get('/forgot-password', [ForgotPasswordController::class, 'create'])
    ->middleware('guest')
    ->name('password.request');
Route::post('/forgot-password', [ForgotPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.email');
Route::get('/reset-password/{token}', [ResetPasswordController::class, 'create'])
    ->middleware('guest')
    ->name('password.reset');
Route::post('/reset-password', [ResetPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.update');

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

    Route::get('/profile/{user}', [UserController::class, 'edit'])->name('profile.edit');

    Route::group(['prefix' => '/evaluation-schedules'], static function () {
        Route::get('/', [EvaluationScheduleController::class, 'index']);
        Route::post('/', [EvaluationScheduleController::class, 'store']);
        Route::delete('/{evaluationSchedule}', [EvaluationScheduleController::class, 'destroy']);
        Route::group(['prefix' => '{evaluationSchedule}/evaluatees'], static function () {
            Route::get('/', [EvaluationScheduleEvaluateeController::class, 'index']);
            Route::post('/', [EvaluationScheduleEvaluateeController::class, 'store']);
        });
        Route::group(['prefix' => '{evaluationSchedule}/subject-classes/{evaluationScheduleSubjectClass}/class-rosters'], static function () {
            Route::get('/', [EvaluationScheduleSubjectClassRosterController::class, 'index']);
            Route::post('/', [EvaluationScheduleSubjectClassRosterController::class, 'store']);
        });
    });

    Route::group(['prefix' => '/calculate-evaluation-result/{evaluationScheduleSubjectClass}'], static function () {
        Route::post('/', [EvaluationResultController::class, 'store']);
    });

    /**
     * Evaluation Manager only routes
     */
    Route::group(['prefix' => '/evaluation-forms', 'middleware' => ['role:Evaluation Manager']], static function () {
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

    Route::group(['prefix' => '/departments', 'middleware' => ['role:Evaluation Manager']], static function () {
        Route::get('/', [DepartmentController::class, 'index']);
        Route::post('/', [DepartmentController::class, 'store']);
    });

    Route::group(['prefix' => '/subjects', 'middleware' => ['role:Evaluation Manager']], static function () {
        Route::get('/', [SubjectController::class, 'index']);
        Route::post('/', [SubjectController::class, 'store']);
    });

    Route::group(['prefix' => '/courses', 'middleware' => ['role:Evaluation Manager']], static function () {
        Route::get('/', [CourseController::class, 'index'])->name('courses.list');
        Route::post('/', [CourseController::class, 'store']);
    });

    Route::group(['prefix' => '/users', 'middleware' => ['role:Evaluation Manager']], static function () {
        Route::get('/', [UserController::class, 'index'])->name('users.list');
        Route::post('/', [UserController::class, 'store']);
    });

    Route::group(['prefix' => '/import-templates', 'middleware' => ['role:Evaluation Manager']], static function () {
        Route::get('/departments', [DepartmentController::class, 'downloadTemplate']);
        Route::get('/courses', [CourseController::class, 'downloadTemplate']);
        Route::get('/subjects', [SubjectController::class, 'downloadTemplate']);
        Route::get('/users', [UserController::class, 'downloadTemplate']);
        Route::get('/classes', [EvaluationScheduleEvaluateeController::class, 'downloadTemplate']);
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

Route::get('/test-calculate-evaluation-result/{id}', function ($code) {
    $x = resolve(EvaluationResultService::class);

    return $x->calculate(EvaluationScheduleSubjectClass::where('code', $code)->first());
});

Route::get('/test-user-departments', function () {
    $user = User::find(1);
    echo $user->departments;
});
