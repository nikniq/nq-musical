<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class QuizController extends Controller
{
    public function index(): View
    {
        return view('home', ['quizzes' => config('quizzes')]);
    }

    public function show(string $slug): View
    {
        $quiz = config("quizzes.$slug");
        abort_unless($quiz, 404);

        return view('quiz', ['slug' => $slug, 'quiz' => $quiz]);
    }
}
