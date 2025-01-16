<?php

namespace App\Repositories;

use App\Models\Evaluatee;
use App\Models\EvaluationSchedule;
use App\Models\Semester;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class EvaluationScheduleRepository
{
    public function __construct(
        protected EvaluationSchedule $evaluationSchedule,
        protected Evaluatee $evaluatee,
        protected Semester $semester
    ) {}

    public function getLatestEvaluationSchedule(): ?EvaluationSchedule
    {
        return $this->evaluationSchedule
            ->newQuery()
            ->where('is_open', 1)
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester_id', 'desc')
            ->with([
                'semester',
                'subjectClasses' => function (BelongsToMany $query) {
                    $query->with([
                        'subject',
                        'course',
                        'assignedTo',
                    ]);
                    $query->join('subjects', 'subjects.id', '=', 'subject_classes.subject_id');
                    $query->orderBy('subjects.title', 'asc');
                },
                'evaluationScheduleSubjectClasses' => function (HasMany $query) {
                    $query->with([
                        'evaluationResult',
                    ]);
                    $query->withCount([
                        'evaluationPasscodes as respondents_count',
                        'evaluationPasscodes as respondents_submitted_count' => function ($query) {
                            $query->where('submitted', 1);
                        },
                    ]);
                },
            ])
            ->withCount([
                'subjectClasses',
                'subjectClasses as subject_classes_count_open' => function ($query) {
                    $query->where('is_open', 1);
                },
                'subjectClasses as subject_classes_count_closed' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },
            ])
            ->first();
    }

    public function save(array $data): EvaluationSchedule
    {
        return $this->evaluationSchedule->newQuery()->create($data);
    }

    public function getAllAcademicYearsAndSemesters(int $perPage)
    {
        $evaluationScheduleTable = $this->evaluationSchedule->getTable();
        $semesterTable = $this->semester->getTable();

        return DB::table($evaluationScheduleTable)
            ->select([
                "$evaluationScheduleTable.academic_year",
                "$evaluationScheduleTable.semester_id",
                "$semesterTable.title as semester_title",
            ])
            ->join($semesterTable, "$evaluationScheduleTable.semester_id", '=', "$semesterTable.id")
            ->orderBy("$evaluationScheduleTable.academic_year", 'desc')
            ->orderBy("$evaluationScheduleTable.semester_id", 'desc')
            ->groupBy('academic_year', 'semester_id')
            ->paginate($perPage);
    }

    public function getEvaluationSchedulesByAcademicYearsAndSemesters(array $academicYears, array $semesterIds): Collection
    {
        return $this->evaluationSchedule
            ->newQuery()
            ->with(['evaluationType', 'semester'])
            ->withCount([
                'subjectClasses',
                'subjectClasses as subject_classes_open_count' => function ($query) {
                    $query->where('is_open', 1);
                },
                'subjectClasses as subject_classes_closed_count' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },

                'evaluatees',
                'evaluatees as evaluatees_open_count' => function ($query) {
                    $query->where('is_open', 1);
                },
                'evaluatees as evaluatees_closed_count' => function ($query) {
                    $query->where('is_open', '<>', 1);
                },
            ])
            ->where(function (Builder $query) use ($academicYears, $semesterIds) {
                $query->whereIn('academic_year', $academicYears);
                $query->whereIn('semester_id', $semesterIds);
            })
            ->get();
    }
}
