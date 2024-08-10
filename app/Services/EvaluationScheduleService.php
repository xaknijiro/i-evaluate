<?php

namespace App\Services;

use App\Models\EvaluationSchedule;
use App\Models\User;
use App\Repositories\EvaluationScheduleRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationScheduleService
{
    public function __construct(
        protected EvaluationScheduleRepository $evaluationScheduleRepository,
        protected User $userModel
    ) {}

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

    public function getEvaluatees(EvaluationSchedule $evaluationSchedule)
    {
        $perPage = 5;

        $evaluatees = $this->userModel
            ->newQuery()
            ->with([
                'subjectClasses.subject',
                'subjectClasses.course',
                'subjectClasses.evaluationSchedule',
                'subjectClasses.evaluationScheduleSubjectClass.evaluationResult',
            ])
            ->whereHas('subjectClasses.evaluationSchedule', function (Builder $query) use ($evaluationSchedule) {
                $relationTable = $query->getModel()->getTable();
                $query->where("$relationTable.id", $evaluationSchedule->id);
            })
            ->whereHas('subjectClasses.evaluationScheduleSubjectClass', function (Builder $query) use ($evaluationSchedule) {
                $relationTable = $query->getModel()->getTable();
                $query->where("$relationTable.evaluation_schedule_id", $evaluationSchedule->id);
            })
            ->withCount([
                'subjectClasses',
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

        return $evaluatees;
    }
}
