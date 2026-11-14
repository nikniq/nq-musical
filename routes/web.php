<?php

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::get('/', [QuizController::class, 'index'])->name('home');
Route::get('/quiz/{slug}', [QuizController::class, 'show'])->name('quiz.show');
