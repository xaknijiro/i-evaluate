<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_schedule_subject_class_id',
        'details',
        'remarks',
        'is_released',
    ];

    protected $casts = [
        'details' => 'json',
        'remarks' => 'json',
        'is_released' => 'boolean',
    ];
}
