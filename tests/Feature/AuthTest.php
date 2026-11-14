<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_logs_in(): void
    {
        $this->post('/register', [
            'name' => 'Amy', 'email' => 'amy@example.com',
            'password' => 'secret-pass', 'password_confirmation' => 'secret-pass',
        ])->assertRedirect('/');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'amy@example.com']);
    }

    public function test_login_and_logout(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);

        $this->post('/login', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();

        $this->post('/login', ['email' => $user->email, 'password' => 'secret-pass'])->assertRedirect('/');
        $this->assertAuthenticatedAs($user);

        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_pages_render_with_google_button_when_configured(): void
    {
        config(['services.google.client_id' => 'abc']);
        $this->get('/login')->assertOk()->assertSee('Continue with Google');
        $this->get('/register')->assertOk()->assertSee('Continue with Google');

        config(['services.google.client_id' => null]);
        $this->get('/login')->assertOk()->assertDontSee('Continue with Google');
        $this->get('/auth/google')->assertNotFound();
    }

    private function fakeGoogle(string $id, string $email): void
    {
        $g = (new SocialiteUser)->map(['id' => $id, 'name' => 'Gina', 'email' => $email, 'avatar' => 'https://x/a.png']);
        $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
        $provider->shouldReceive('user')->andReturn($g);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_google_callback_creates_new_user(): void
    {
        $this->fakeGoogle('g-1', 'gina@example.com');
        $this->get('/auth/google/callback')->assertRedirect('/');

        $user = User::where('email', 'gina@example.com')->first();
        $this->assertSame('g-1', $user->google_id);
        $this->assertNull($user->password);
        $this->assertAuthenticatedAs($user);
    }

    public function test_google_callback_links_existing_email_account(): void
    {
        $existing = User::factory()->create(['email' => 'gina@example.com']);
        $this->fakeGoogle('g-2', 'gina@example.com');
        $this->get('/auth/google/callback')->assertRedirect('/');

        $this->assertSame(1, User::count());
        $this->assertSame('g-2', $existing->fresh()->google_id);
        $this->assertAuthenticatedAs($existing);
    }
}
