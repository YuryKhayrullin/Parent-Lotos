<?php

namespace App\Services\Yclients;

use App\Models\ParentProfile;
use App\Models\Child;
use App\Exceptions\Yclients\ClientNotFoundException;
use App\Exceptions\YclientsApiException;
use Illuminate\Support\Facades\Cache;

class ClientService
{
    private YclientsClient $yclients;
    private int $companyId;

    public function __construct(YclientsClient $yclients)
    {
        $this->yclients = $yclients;
        $this->companyId = (int) config('yclients.company_id');
    }

    public function syncParentWithChildren(string $phone): ParentProfile
    {
        $cacheKeyClientByPhone = "yclients:client:phone:{$phone}";
        $ycClient = Cache::remember($cacheKeyClientByPhone, 3600, function () use ($phone) {
            return $this->yclients->findClientByPhone($phone);
        });

        if (!$ycClient) {
            throw new ClientNotFoundException("YCLIENTS client not found for phone: {$phone}");
        }

        $cacheKeyFullClient = "yclients:client:{$ycClient['id']}";
        $full = Cache::remember($cacheKeyFullClient, 3600, function () use ($ycClient) {
            return $this->yclients->getClient($ycClient['id']);
        });

        $parent = ParentProfile::updateOrCreate(
            ['phone' => $phone],
            [
                'yclients_client_id' => $full['id'],
                'name' => $full['name'] ?? 'Неизвестный родитель',
                'email' => $full['email'] ?? null,
                'synced_at' => now(),
            ]
        );

        foreach ($full['comers'] ?? $full['visitors'] ?? [] as $visitor) {
            Child::updateOrCreate(
                ['yclients_visitor_id' => $visitor['id']],
                [
                    'parent_id' => $parent->id,
                    'name'      => $visitor['name'] ?? 'Неизвестный ребенок',
                ]
            );
        }

        return $parent;
    }
}