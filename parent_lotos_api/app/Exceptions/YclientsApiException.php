<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Client\Response;

class YclientsApiException extends Exception
{
    protected ?Response $response;

    public function __construct(string $message, int $code = 0, ?Response $response = null, \Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->response = $response;
    }

    public function getApiResponse(): ?Response
    {
        return $this->response;
    }

    public function render($request)
    {
        return response()->json([
            'message' => 'An external API error occurred: ' . $this->getMessage(),
            'code' => $this->getCode(),
        ], $this->getCode() >= 400 && $this->getCode() < 600 ? $this->getCode() : 500);
    }
}