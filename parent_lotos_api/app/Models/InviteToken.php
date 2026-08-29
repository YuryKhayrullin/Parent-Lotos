<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InviteToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'token',
        'phone',
        'expires_at',
        'used_at',
        'source',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ParentProfile::class);
    }
}
