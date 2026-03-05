<?php

namespace Tests\Feature\Trello;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_sanctum_token(): void
    {
        $user = User::factory()->create([
            'email' => 'api-user@example.com',
            'password' => bcrypt('secret-pass'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'secret-pass',
            'device_name' => 'phpunit',
        ])->assertOk()->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'email'],
        ]);
    }
}
