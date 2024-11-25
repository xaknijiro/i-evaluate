<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluator extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluatorFactory> */
    use HasFactory;

    public $fillable = [
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function evaluatee(): BelongsTo
    {
        return $this->belongsTo(Evaluatee::class);
    }
}
