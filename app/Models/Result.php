<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    /** @use HasFactory<\Database\Factories\ResultFactory> */
    use HasFactory;

    protected $fillable = [
        'evaluatee_id',
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
