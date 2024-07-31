<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'likert_scale_id',
        'published',
        'archived',
    ];

    public function criteria(): HasMany
    {
        return $this->hasMany(Criterion::class);
    }

    public function likertScale(): BelongsTo
    {
        return $this->belongsTo(LikertScale::class);
    }
}
