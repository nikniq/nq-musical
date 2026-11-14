@extends('layouts.app')

@section('title', 'Log in')

@section('content')
    <div class="auth-card">
        <h1>Welcome back</h1>
        <p class="muted">Log in to keep practising.</p>
        @include('auth._google')
        <form method="POST" action="{{ route('login') }}" class="form">
            @csrf
            <label>Email
                <input type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="email">
            </label>
            <label>Password
                <input type="password" name="password" required autocomplete="current-password">
            </label>
            @error('email') <p class="error">{{ $message }}</p> @enderror
            <label class="check"><input type="checkbox" name="remember"> Remember me</label>
            <button class="btn primary" type="submit">Log in</button>
        </form>
        <p class="muted center">New here? <a href="{{ route('register') }}">Create an account</a></p>
    </div>
@endsection
