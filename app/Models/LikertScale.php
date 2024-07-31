<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LikertScale extends Model
{
    use HasFactory;

    protected $casts = [
        'default_options' => 'json',
    ];

    protected $fillable = [
        'title',
        'code',
        'max_score',
        'default_options',
    ];
}
