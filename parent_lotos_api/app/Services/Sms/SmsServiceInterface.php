<?php

namespace App\Services\Sms;

interface SmsServiceInterface
{
    public function send(string $phone, string $message): void;
}
