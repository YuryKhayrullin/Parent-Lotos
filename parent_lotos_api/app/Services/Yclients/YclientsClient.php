<?php

namespace App\Services\Yclients;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Carbon;
use App\Exceptions\YclientsApiException;

class YclientsClient
{
    private PendingRequest $http;
    private string $partnerToken;
    private string $userToken;
    private int $companyId;

    public function __construct(
        PendingRequest $http,
        string $partnerToken,
        string $userToken,
        int $companyId
    ) {
        $this->partnerToken = $partnerToken;
        $this->userToken = $userToken;
        $this->companyId = $companyId;

        $this->http = $http->baseUrl(config('yclients.base_url'))
                           ->withHeaders([
                               'Accept' => 'application/json',
                               'Authorization' => 'Bearer ' . $this->partnerToken,
                               'Partner-Token' => $this->partnerToken,
                           ])
                           ->retry(3, 100);
    }

    private function get(string $path, array $query = []): array
    {
        try {
            $response = $this->http->withHeaders([
                'User-Token' => $this->userToken,
            ])->get($path, $query);

            $response->throw();

            return $response->json();
        } catch (\Throwable $e) {
            throw new YclientsApiException("Error fetching YCLIENTS data from {$path}: " . $e->getMessage(), $e->getCode(), $response ?? null);
        }
    }

    private function post(string $path, array $data = []): array
    {
        try {
            $response = $this->http->withHeaders([
                'User-Token' => $this->userToken,
            ])->post($path, $data);

            $response->throw();

            return $response->json();
        } catch (\Throwable $e) {
            throw new YclientsApiException("Error posting data to YCLIENTS {$path}: " . $e->getMessage(), $e->getCode(), $response ?? null);
        }
    }

    public function findClientByPhone(string $phone): ?array
    {
        $response = $this->get("clients/{$this->companyId}", ['phone' => $phone]);
        return $response['data'][0] ?? null;
    }

    public function getClient(int $clientId): array
    {
        return $this->get("client/{$this->companyId}/{$clientId}")['data'];
    }

    public function getRecords(int $clientId, Carbon $from, Carbon $to): array
    {
        return $this->get("records/{$this->companyId}", [
            'client_id'  => $clientId,
            'start_date' => $from->toDateString(),
            'end_date'   => $to->toDateString(),
        ])['data'];
    }

    public function sendSms(array $clientIds, string $text): void
    {
        $this->post("sms/clients/by_id/{$this->companyId}", [
            'client_ids' => $clientIds,
            'text'       => $text,
        ]);
    }

    public function getClientLoyalty(int $clientId): array
    {
        return $this->get("loyalty/{$this->companyId}/client/{$clientId}")['data'] ?? [];
    }
}