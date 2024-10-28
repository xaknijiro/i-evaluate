<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_schedule_subject_class_id',
        'indicator_id',
        'value',
        'comments',
    ];
}
