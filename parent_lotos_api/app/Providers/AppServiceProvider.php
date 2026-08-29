<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Http;
use App\Services\Yclients\YclientsClient;
use App\Services\Yclients\ClientService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(YclientsClient::class, function ($app) {
            return new YclientsClient(
                Http::baseUrl(config('yclients.base_url')),
                config('yclients.partner_token'),
                config('yclients.user_token'),
                (int) config('yclients.company_id')
            );
        });

        $this->app->singleton(ClientService::class, function ($app) {
            return new ClientService($app->make(YclientsClient::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
