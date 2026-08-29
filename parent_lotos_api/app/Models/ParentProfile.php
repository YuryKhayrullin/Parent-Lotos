<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'yclients_client_id',
        'phone',
        'name',
        'email',
        'synced_at',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(Child::class);
    }

    public function inviteTokens(): HasMany
    {
        return $this->hasMany(InviteToken::class);
    }

    public function medicalCertificates(): HasMany
    {
        return $this->hasMany(MedicalCertificate::class);
    }
}
