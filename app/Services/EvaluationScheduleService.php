<?php

namespace App\Services;

use App\Models\Evaluatee;
use App\Models\EvaluationSchedule;
use App\Models\Evaluator;
use App\Models\User;
use App\Repositories\EvaluationScheduleRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class EvaluationScheduleService
{
    public function __construct(
        protected Evaluatee $evaluateeModel,
        protected Evaluator $evaluatorModel,
        protected EvaluationScheduleRepository $evaluationScheduleRepository,
        protected Role $roleModel,
        protected User $userModel
    ) {}

    public function create(array $data): EvaluationSchedule
    {
        return $this->evaluationScheduleRepository->save($data);
    }

    public function getLatestEvaluationSchedule(): ?EvaluationSchedule
    {
        $latestEvaluationSchedule = $this->evaluationScheduleRepository->getLatestEvaluationSchedule();

        if ($latestEvaluationSchedule) {
            $latestEvaluationSchedule->evaluatees = $latestEvaluationSchedule->subjectClasses
                ->groupBy('assigned_to')
                ->map(fn ($group) => $group->first()->assignedTo)
                ->values();
        }

        return $latestEvaluationSchedule;
    }

    public function getEvaluatees(EvaluationSchedule $evaluationSchedule, array $filters = [], ?int $perPage = null)
    {
        $isEvaluationManager = Auth::user()->hasRole('Evaluation Manager');

        $query = $this->userModel->newQuery();

        if (! $isEvaluationManager) {
            $query->where('id', Auth::id());
        }

        if ($filters['search'] ?? false && ! $filters['search']) {
            $search = $filters['search'];
            $query->where(function (Builder $query) use ($search) {
                $query->where('last_name', 'like', "%$search%");
                $query->orWhere('first_name', 'like', "%$search%");
                $query->orWhere('email', 'like', "%$search%");
            });
        }

        if ($evaluationSchedule->evaluationType->code === 'student-to-teacher-evaluation') {
            $query
                ->withWhereHas('subjectClasses', function (Builder|HasMany $query) use ($evaluationSchedule) {
                    $query->with(['subject', 'course']);
                    $query->withWhereHas('evaluationSchedule', function (Builder|HasOneThrough $query) use ($evaluationSchedule) {
                        $relationTable = $query->getModel()->getTable();
                        $query->where("$relationTable.id", $evaluationSchedule->id);
                    });
                    $query->withWhereHas('evaluationScheduleSubjectClass', function (Builder|HasOne $query) use ($evaluationSchedule) {
                        $relationTable = $query->getModel()->getTable();
                        $query->where("$relationTable.evaluation_schedule_id", $evaluationSchedule->id);
                        $query->with(['evaluationPasscodes', 'evaluationResult']);
                        $query->withCount([
                            'evaluationPasscodes',
                            'evaluationPasscodes as evaluation_passcodes_count_submitted' => function ($query) {
                                $query->where('submitted', 1);
                            },
                        ]);
                    });
                })
                ->withCount([
                    'subjectClasses' => function (Builder $query) use ($evaluationSchedule) {
                        $query->whereHas('evaluationScheduleSubjectClass', function (Builder $query) use ($evaluationSchedule) {
                            $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                        });
                    },
                    'subjectClasses as subject_classes_count_open' => function ($query) use ($evaluationSchedule) {
                        $query->whereHas('evaluationScheduleSubjectClass', function (Builder $query) use ($evaluationSchedule) {
                            $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                            $query->where('is_open', 1);
                        });
                    },
                    'subjectClasses as subject_classes_count_closed' => function ($query) use ($evaluationSchedule) {
                        $query->whereHas('evaluationScheduleSubjectClass', function (Builder $query) use ($evaluationSchedule) {
                            $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                            $query->where('is_open', '<>', 1);
                        });
                    },
                ]);
        } else {
            $query
                ->withWhereHas('evaluatees', function (Builder|HasMany $query) use ($evaluationSchedule) {
                    $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                    $query->with('evaluators');
                    $query->withCount([
                        'evaluators',
                        'evaluators as evaluators_pending_count' => function (Builder $query) {
                            $query->where('submitted', '<>', 1);
                        },
                        'evaluators as evaluators_submitted_count' => function (Builder $query) {
                            $query->where('submitted', 1);
                        },
                    ]);
                })
                ->withCount([
                    'evaluatees' => function (Builder $query) use ($evaluationSchedule) {
                        $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                    },
                    'evaluatees as evaluatees_open_count' => function (Builder $query) use ($evaluationSchedule) {
                        $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                        $query->where('is_open', 1);
                    },
                    'evaluatees as evaluatees_closed_count' => function (Builder $query) use ($evaluationSchedule) {
                        $query->where('evaluation_schedule_id', $evaluationSchedule->id);
                        $query->where('is_open', '<>', 1);
                    },
                ]);
        }

        return $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }

    public function populateEntries(EvaluationSchedule $evaluationSchedule)
    {
        if ($evaluationSchedule->evaluationType->code === 'student-to-teacher-evaluation') {
            return;
        }

        $users = $this->userModel->newQuery()
            ->whereHas('departments')
            ->whereDoesntHave('evaluatees', function (Builder $query) use ($evaluationSchedule) {
                $query->where('evaluation_schedule_id', $evaluationSchedule->id);
            })
            ->get();

        $departmentIds = $users->pluck('departments.*.id')
            ->flatten()
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $users = $users->filter(fn (User $user) => $user->hasRole('Teaching'));
        if (in_array($evaluationSchedule->evaluationType->code, ['peer-evaluation', 'dean-to-teacher-evaluation'])) {
            $users = $users->filter(fn (User $user) => ! $user->hasRole('Dean'));
        }

        $candidateUsers = $users->map(function (User $user) use ($evaluationSchedule) {
            return [
                'evaluation_schedule_id' => $evaluationSchedule->id,
                'user_id' => $user->id,
            ];
        });

        if ($candidateUsers->isNotEmpty()) {
            DB::transaction(function () use ($candidateUsers, $departmentIds, $evaluationSchedule) {
                $evaluatorsLookup = $this->userModel->newQuery()
                    ->with('departments')
                    ->whereHas('departments', function (Builder $query) use ($departmentIds) {
                        $relationTable = $query->getModel()->getTable();
                        $query->whereIn("$relationTable.id", $departmentIds);
                    })
                    ->get()
                    ->groupBy('departments.*.code');
                $this->evaluateeModel->newQuery()
                    ->upsert(
                        $candidateUsers->toArray(),
                        ['evaluation_schedule_id', 'user_id']
                    );

                if ($evaluationSchedule->evaluationType->code === 'peer-evaluation') {
                    $evaluationSchedule->evaluatees->each(function (Evaluatee $evaluatee) use ($evaluatorsLookup) {
                        $evaluateeDepartmentCode = $evaluatee->user->departments->first()->code;
                        $candidateEvaluatorUsers = $evaluatorsLookup->get($evaluateeDepartmentCode)?->filter(function (User $user) use ($evaluatee) {
                            return $user->id !== $evaluatee->user->id
                                && $user->hasRole('Teaching')
                                && ! $user->hasRole('Dean');
                        }) ?? collect();
                        $candidateEvaluators = $candidateEvaluatorUsers->map(function (User $user) {
                            return [
                                'user_id' => $user->id,
                            ];
                        });
                        $candidateEvaluators = $candidateEvaluators->unique('user_id');
                        if ($candidateEvaluators->isNotEmpty()) {
                            $evaluatee->evaluators()->createMany($candidateEvaluators);
                        }
                    });
                } elseif ($evaluationSchedule->evaluationType->code === 'dean-to-teacher-evaluation') {
                    $role = $this->roleModel->where('name', 'Dean')->first();
                    $deanUsers = $role->users->groupBy('departments.*.code');
                    $evaluationSchedule->evaluatees->each(function (Evaluatee $evaluatee) use ($deanUsers) {
                        $evaluateeDepartmentCode = $evaluatee->user->departments->first()->code;
                        $candidateEvaluatorUsers = $deanUsers->get($evaluateeDepartmentCode)?->filter(function (User $user) use ($evaluatee) {
                            return $user->id !== $evaluatee->user->id;
                        }) ?? collect();
                        $candidateEvaluators = $candidateEvaluatorUsers->map(function (User $user) {
                            return [
                                'user_id' => $user->id,
                            ];
                        });
                        $candidateEvaluators = $candidateEvaluators->unique('user_id');
                        if ($candidateEvaluators->isNotEmpty()) {
                            $evaluatee->evaluators()->createMany($candidateEvaluators);
                        }
                    });
                } else {
                    if ($evaluationSchedule->evaluationType->code === 'self-evaluation') {
                        $evaluationSchedule->evaluatees->each(function (Evaluatee $evaluatee) {
                            $evaluatee->evaluators()->create([
                                'user_id' => $evaluatee->user->id,
                            ]);
                        });
                    }
                }
            });
        }
    }

    public function getPendingTasksAsEvaluator(User $user): Collection
    {
        return $this->evaluatorModel
            ->newQuery()
            ->with('evaluatee')
            ->where([
                'user_id' => $user->id,
                'submitted' => 0,
            ])
            ->get();
    }
}
