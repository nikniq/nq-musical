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
    </header>
    <main class="container">
        @yield('content')
    </main>
    @stack('scripts')
</body>
</html>
