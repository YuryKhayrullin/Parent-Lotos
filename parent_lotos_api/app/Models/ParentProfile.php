<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class ParentProfile extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'yclients_client_id',
        'phone',
        'name',
        'email',
        'synced_at',
        'pin_code',
    ];

    protected $hidden = [
        'pin_code',
    ];

    protected $appends = [
        'has_pin',
    ];

    public function getHasPinAttribute(): bool
    {
        return !is_null($this->pin_code);
    }

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
