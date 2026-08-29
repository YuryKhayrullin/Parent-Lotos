<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalCertificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'child_id',
        'file_path',
        'status',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ParentProfile::class);
    }

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }
}
