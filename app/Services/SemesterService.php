<?php

namespace App\Services;

use App\Repositories\SemesterRepository;
use Illuminate\Database\Eloquent\Collection;

class SemesterService
{
    public function __construct(
        protected SemesterRepository $semesterRepository,
    ) {}

    public function getSemesters(): Collection
    {
        return $this->semesterRepository->getSemesters();
    }
}
