<?php

use App\Http\Controllers\EvaluationFormController;
use App\Http\Controllers\EvaluationFormCriterionController;
use App\Http\Controllers\StaticPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StaticPageController::class, 'evaluate']);

Route::get('/about', [StaticPageController::class, 'about']);


Route::group(['prefix' => '/evaluation-forms'], static function () {
    Route::get('/', [EvaluationFormController::class, 'index']);
    Route::get('/{evaluationForm}', [EvaluationFormController::class, 'show']);
    Route::delete('/{evaluationForm}', [EvaluationFormController::class, 'destroy']);

    Route::group(['prefix' => '{evaluationForm}/criteria'], static function () {
        Route::post('/', [EvaluationFormCriterionController::class, 'store']);
        Route::patch('/{criterion}', [EvaluationFormCriterionController::class, 'update']);
        Route::delete('/{criterion}', [EvaluationFormCriterionController::class, 'destroy']);
    });
});
