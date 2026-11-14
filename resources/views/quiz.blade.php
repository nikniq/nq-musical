@extends('layouts.app')

@section('title', $quiz['title'])

@section('content')
    <a href="{{ route('home') }}" class="back">← All quizzes</a>
    <div id="quiz" class="quiz"
         data-slug="{{ $slug }}"
         data-type="{{ $quiz['type'] }}"
         data-options='@json($quiz['options'], JSON_FORCE_OBJECT)'>
        <h1>{{ $quiz['icon'] }} {{ $quiz['title'] }}</h1>
        <p class="muted">{{ $quiz['description'] }}</p>
        <noscript>This quiz needs JavaScript enabled.</noscript>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('js/quiz.js') }}"></script>
@endpush
