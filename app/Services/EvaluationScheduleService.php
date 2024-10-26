<?php

namespace App\Services;

use App\Models\EvaluationSchedule;
use App\Models\User;
use App\Repositories\EvaluationScheduleRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Facades\Auth;

class EvaluationScheduleService
{
    public function __construct(
        protected EvaluationScheduleRepository $evaluationScheduleRepository,
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

        if (!$isEvaluationManager) {
            $query->where('id', Auth::id());
        }

        if ($filters['search'] ?? false && !$filters['search']) {
            $search = $filters['search'];
            $query->where(function (Builder $query) use ($search) {
                $query->where('last_name', 'like', "%$search%");
                $query->orWhere('first_name', 'like', "%$search%");
                $query->orWhere('email', 'like', "%$search%");
            });
        }

        return $query
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
            ])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($perPage);
    }
}
