<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Criterion extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'is_weighted',
        'weight',
    ];

    protected $casts = [
        'is_weighted' => 'boolean',
    ];

    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class);
    }
}
