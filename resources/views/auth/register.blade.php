@extends('layouts.app')

@section('title', 'Register')

@section('content')
    <div class="auth-card">
        <h1>Create an account</h1>
        <p class="muted">Free for every piano student.</p>
        @include('auth._google')
        <form method="POST" action="{{ route('register') }}" class="form">
            @csrf
            <label>Name
                <input type="text" name="name" value="{{ old('name') }}" required autofocus autocomplete="name">
            </label>
            @error('name') <p class="error">{{ $message }}</p> @enderror
            <label>Email
                <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email">
            </label>
            @error('email') <p class="error">{{ $message }}</p> @enderror
            <label>Password
                <input type="password" name="password" required autocomplete="new-password" minlength="8">
            </label>
            <label>Confirm password
                <input type="password" name="password_confirmation" required autocomplete="new-password">
            </label>
            @error('password') <p class="error">{{ $message }}</p> @enderror
            <button class="btn primary" type="submit">Create account</button>
        </form>
        <p class="muted center">Already have an account? <a href="{{ route('login') }}">Log in</a></p>
    </div>
@endsection
