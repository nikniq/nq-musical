# Note Quest — piano music quiz

Laravel app of music-theory quizzes for piano students. The web root is **`public_html/`** (not `public/`), set in `bootstrap/app.php` via `usePublicPath()`.

## Run
    composer install && cp .env.example .env && php artisan key:generate
    php artisan serve        # http://127.0.0.1:8000

No npm build is needed: quizzes run from `public_html/js/quiz.js` and `public_html/css/app.css`.

## Quizzes
Treble/bass/grand-staff note reading, find-the-key (staff → keyboard), name-the-key, interval reading, key signatures, note values, higher/lower and interval ear training (Web Audio), and Italian musical terms.

## Adding a quiz
1. Add an entry to `config/quizzes.php` (slug, title, `type`, options).
2. If it's a new `type`, add a generator to `GENERATORS` in `public_html/js/quiz.js`.
