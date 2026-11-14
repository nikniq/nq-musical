<?php

namespace Tests\Feature;

use Tests\TestCase;

class QuizTest extends TestCase
{
    public function test_home_lists_all_quizzes(): void
    {
        $response = $this->get('/')->assertOk();
        foreach (config('quizzes') as $quiz) {
            $response->assertSee($quiz['title']);
        }
    }

    public function test_each_quiz_page_renders(): void
    {
        foreach (array_keys(config('quizzes')) as $slug) {
            $this->get("/quiz/$slug")->assertOk()->assertSee('js/quiz.js');
        }
    }

    public function test_unknown_quiz_returns_404(): void
    {
        $this->get('/quiz/nope')->assertNotFound();
    }

    public function test_public_path_is_public_html(): void
    {
        $this->assertSame(base_path('public_html'), public_path());
    }
}
