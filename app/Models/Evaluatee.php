<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Evaluatee extends Model
{
    /** @use HasFactory<\Database\Factories\EvaluateeFactory> */
    use HasFactory;

    protected $fillable = [
        'evaluation_schedule_id',
        'user_id',
        'is_open',
    ];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public function evaluators(): HasMany
    {
        return $this->hasMany(Evaluator::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function evaluationSchedule(): BelongsTo
    {
        return $this->belongsTo(EvaluationSchedule::class);
    }

    public function evaluationResult(): HasOne
    {
        return $this->hasOne(Result::class, 'evaluatee_id');
    }
}
