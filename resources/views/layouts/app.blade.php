<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Note Quest') · Piano Music Quiz</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>
    <header class="topbar">
        <a href="{{ route('home') }}" class="brand">🎹 Note Quest</a>
        <span class="tagline">Music theory practice for piano students</span>
        <nav class="nav">
            @auth
                @if (auth()->user()->avatar)
                    <img src="{{ auth()->user()->avatar }}" alt="" class="avatar" referrerpolicy="no-referrer">
                @endif
                <span>{{ auth()->user()->name }}</span>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="link-btn">Log out</button>
                </form>
            @else
                <a href="{{ route('login') }}">Log in</a>
                <a href="{{ route('register') }}" class="btn primary small">Sign up</a>
            @endauth
        </nav>
    </header>
    <main class="container">
        @yield('content')
    </main>
    @stack('scripts')
</body>
</html>
