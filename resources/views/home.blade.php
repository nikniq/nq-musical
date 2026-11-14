@extends('layouts.app')

@section('content')
    <section class="hero">
        <h1>Pick a quiz</h1>
        <p>Ten questions each. Your best score is saved on this device.</p>
    </section>
    <div class="grid">
        @foreach ($quizzes as $slug => $quiz)
            <a class="card" href="{{ route('quiz.show', $slug) }}">
                <div class="card-icon">{{ $quiz['icon'] }}</div>
                <h2>{{ $quiz['title'] }}</h2>
                <p>{{ $quiz['description'] }}</p>
                <div class="card-meta">
                    <span class="badge badge-{{ strtolower($quiz['level']) }}">{{ $quiz['level'] }}</span>
                    <span class="best" data-best="{{ $slug }}"></span>
                </div>
            </a>
        @endforeach
    </div>
@endsection

@push('scripts')
<script>
    document.querySelectorAll('[data-best]').forEach(el => {
        try {
            const b = localStorage.getItem('nq-best-' + el.dataset.best);
            if (b !== null) el.textContent = '⭐ Best ' + b + '/10';
        } catch (e) {}
    });
</script>
@endpush
