<?php

use App\Models\Department;
use App\Models\EvaluationSchedule;
use App\Models\EvaluationType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::group(['prefix' => '/charts'], function () {
        Route::group(['prefix' => '/bar'], function () {
            Route::get('/faculty-by-department', function () {
                $usersByDepartment = User::whereHas('departments')->with('departments')->get()->groupBy('departments.*.code');
                $data = $usersByDepartment->map(function ($users) {
                    return [
                        'value' => $users->count(),
                        'label' => $users->first()->departments->first()->code,
                    ];
                })->values();

                return [
                    'chartData' => $data,
                ];
            });
        });

        Route::group(['prefix' => '/pie'], function () {
            Route::get('/evaluation-status', function () {
                $evaluationTypes = EvaluationType::all();
                $departments = Department::orderBy('code')->get();

                $schedules = EvaluationSchedule::select([
                    'academic_year',
                    'semester_id',
                ])->with('semester')->groupBy([
                    'academic_year',
                    'semester_id',
                ])->get();
                $selectedAcademicYear = $schedules->first()->academic_year;
                $selectedSemester = $schedules->first()->semester;

                $evaluationSchedules = EvaluationSchedule::where([
                    'academic_year' => $selectedAcademicYear,
                    'semester_id' => $selectedSemester->id,
                ])->withCount([
                    'evaluationScheduleSubjectClasses as subject_classes_count_open' => function ($query) {
                        $query->where('is_open', 1);
                    },
                    'evaluationScheduleSubjectClasses as subject_classes_count_closed' => function ($query) {
                        $query->where('is_open', 0);
                    },
                    'evaluatees as evaluatees_count_open' => function ($query) {
                        $query->where('is_open', 1);
                    },
                    'evaluatees as evaluatees_count_closed' => function ($query) {
                        $query->where('is_open', 0);
                    },
                ])->with('evaluationScheduleSubjectClasses', function ($query) {
                    $query->withCount([
                        'evaluationPasscodes as respondents_count_open' => function ($query) {
                            $query->where('submitted', 0);
                        },
                        'evaluationPasscodes as respondents_count_closed' => function ($query) {
                            $query->where('submitted', 1);
                        },
                    ]);
                })->with('evaluatees', function ($query) {
                    $query->withCount([
                        'evaluators as respondents_count_open' => function ($query) {
                            $query->where('submitted', 0);
                        },
                        'evaluators as respondents_count_closed' => function ($query) {
                            $query->where('submitted', 1);
                        },
                    ]);
                })->get()->groupBy('evaluationType.code')->map(function ($evaluationSchedules) {
                    return $evaluationSchedules->first();
                })->map(function ($evaluationSchedule) {
                    $evaluationType = $evaluationSchedule->evaluationType;
                    if ($evaluationType->code === 'student-to-teacher-evaluation') {
                        $respondentsCountOpen = $evaluationSchedule->evaluationScheduleSubjectClasses->sum('respondents_count_open');
                        $respondentsCountClosed = $evaluationSchedule->evaluationScheduleSubjectClasses->sum('respondents_count_closed');
                    } else {
                        $respondentsCountOpen = $evaluationSchedule->evaluatees->sum('respondents_count_open');
                        $respondentsCountClosed = $evaluationSchedule->evaluatees->sum('respondents_count_closed');
                    }

                    return [
                        'label' => $evaluationType->title,
                        'chartData' => [
                            'statuses' => [
                                [
                                    'label' => 'Open',
                                    'value' => $evaluationType->code === 'student-to-teacher-evaluation'
                                        ? $evaluationSchedule->subject_classes_count_open : $evaluationSchedule->evaluatees_count_open,
                                ],
                                [
                                    'label' => 'Closed',
                                    'value' => $evaluationType->code === 'student-to-teacher-evaluation'
                                        ? $evaluationSchedule->subject_classes_count_closed : $evaluationSchedule->evaluatees_count_closed,
                                ],
                            ],
                            'respondents' => [
                                [
                                    'label' => 'Did Not Respond',
                                    'value' => $respondentsCountOpen,
                                ],
                                [
                                    'label' => 'Responded',
                                    'value' => $respondentsCountClosed,
                                ],
                            ],
                        ],

                    ];
                });

                $evaluationSchedulesByDepartment = $departments->keyBy('code')
                    ->map(function (Department $department) use ($selectedAcademicYear, $selectedSemester) {
                        $evaluationSchedules = EvaluationSchedule::where([
                            'academic_year' => $selectedAcademicYear,
                            'semester_id' => $selectedSemester->id,
                        ])->withCount([
                            'evaluationScheduleSubjectClasses as subject_classes_count_open' => function ($query) use ($department) {
                                $query->whereHas('subjectClass.assignedTo.departments', function ($query) use ($department) {
                                    $relationTable = $query->getModel()->getTable();
                                    $query->where("$relationTable.id", $department->id);
                                });
                                $query->where('is_open', 1);
                            },
                            'evaluationScheduleSubjectClasses as subject_classes_count_closed' => function ($query) use ($department) {
                                $query->whereHas('subjectClass.assignedTo.departments', function ($query) use ($department) {
                                    $relationTable = $query->getModel()->getTable();
                                    $query->where("$relationTable.id", $department->id);
                                });
                                $query->where('is_open', 0);
                            },
                            'evaluatees as evaluatees_count_open' => function ($query) use ($department) {
                                $query->whereHas('user.departments', function ($query) use ($department) {
                                    $relationTable = $query->getModel()->getTable();
                                    $query->where("$relationTable.id", $department->id);
                                });
                                $query->where('is_open', 1);
                            },
                            'evaluatees as evaluatees_count_closed' => function ($query) use ($department) {
                                $query->whereHas('user.departments', function ($query) use ($department) {
                                    $relationTable = $query->getModel()->getTable();
                                    $query->where("$relationTable.id", $department->id);
                                });
                                $query->where('is_open', 0);
                            },
                        ])->with('evaluationScheduleSubjectClasses', function ($query) use ($department) {
                            $query->whereHas('subjectClass.assignedTo.departments', function ($query) use ($department) {
                                $relationTable = $query->getModel()->getTable();
                                $query->where("$relationTable.id", $department->id);
                            });
                            $query->withCount([
                                'evaluationPasscodes as respondents_count_open' => function ($query) {
                                    $query->where('submitted', 0);
                                },
                                'evaluationPasscodes as respondents_count_closed' => function ($query) {
                                    $query->where('submitted', 1);
                                },
                            ]);
                        })->with('evaluatees', function ($query) use ($department) {
                            $query->whereHas('user.departments', function ($query) use ($department) {
                                $relationTable = $query->getModel()->getTable();
                                $query->where("$relationTable.id", $department->id);
                            });
                            $query->withCount([
                                'evaluators as respondents_count_open' => function ($query) {
                                    $query->where('submitted', 0);
                                },
                                'evaluators as respondents_count_closed' => function ($query) {
                                    $query->where('submitted', 1);
                                },
                            ]);
                        })->get()->groupBy('evaluationType.code')->map(function ($evaluationSchedules) {
                            return $evaluationSchedules->first();
                        })->map(function ($evaluationSchedule) {
                            $evaluationType = $evaluationSchedule->evaluationType;
                            if ($evaluationType->code === 'student-to-teacher-evaluation') {
                                $respondentsCountOpen = $evaluationSchedule->evaluationScheduleSubjectClasses->sum('respondents_count_open');
                                $respondentsCountClosed = $evaluationSchedule->evaluationScheduleSubjectClasses->sum('respondents_count_closed');
                            } else {
                                $respondentsCountOpen = $evaluationSchedule->evaluatees->sum('respondents_count_open');
                                $respondentsCountClosed = $evaluationSchedule->evaluatees->sum('respondents_count_closed');
                            }

                            return [
                                'label' => $evaluationType->title,
                                'chartData' => [
                                    'statuses' => [
                                        [
                                            'label' => 'Open',
                                            'value' => $evaluationType->code === 'student-to-teacher-evaluation'
                                                ? $evaluationSchedule->subject_classes_count_open : $evaluationSchedule->evaluatees_count_open,
                                        ],
                                        [
                                            'label' => 'Closed',
                                            'value' => $evaluationType->code === 'student-to-teacher-evaluation'
                                                ? $evaluationSchedule->subject_classes_count_closed : $evaluationSchedule->evaluatees_count_closed,
                                        ],
                                    ],
                                    'respondents' => [
                                        [
                                            'label' => 'Responded',
                                            'value' => $respondentsCountClosed,
                                        ],
                                        [
                                            'label' => 'Did Not Respond',
                                            'value' => $respondentsCountOpen,
                                        ],
                                    ],
                                ],

                            ];
                        });

                        return $evaluationSchedules;
                    });

                return [
                    'evaluationTypes' => $evaluationTypes,
                    'selectedAcademicYear' => $selectedAcademicYear,
                    'selectedSemester' => $selectedSemester,
                    'schedules' => $schedules,
                    'evaluationSchedules' => $evaluationSchedules,
                    'evaluationSchedulesByDepartment' => $evaluationSchedulesByDepartment,
                ];
            });
            Route::get('/users-by-gender', function () {
                $result = DB::table('users')
                    ->select(
                        'gender',
                        DB::raw('count(*) as total')
                    )
                    ->groupBy('gender')
                    ->get();

                return $result->map(function ($item) {
                    return [
                        'id' => $item->gender,
                        'label' => $item->gender,
                        'value' => $item->total,
                    ];
                });
            });
        });
    });
});
