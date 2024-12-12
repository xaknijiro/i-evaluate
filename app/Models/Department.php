<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
    ];

    public function users()
    {
        return $this->hasManyThrough(
            User::class,
            DepartmentUser::class,
            'department_id',
            'id',
        );
    }
}
