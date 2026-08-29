<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invite_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('parent_profiles')->onDelete('cascade');
            $table->string('token')->unique();
            $table->string('phone');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->string('source')->default('manual'); // 'webhook_abonement' | 'manual'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invite_tokens');
    }
};
