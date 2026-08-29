<?php

namespace App\Exceptions\Yclients;

use App\Exceptions\YclientsApiException;

class ClientNotFoundException extends YclientsApiException
{
    public function __construct(string $message = "YCLIENTS client not found.", int $code = 404, \Throwable $previous = null)
    {
        parent::__construct($message, $code, null, $previous);
    }
}