<?php

/*
| Quiz catalogue. Each key is the URL slug; `type` selects the generator in
| public_html/js/quiz.js. Add new quizzes here and implement the type in JS.
*/

return [
    'treble-notes' => ['title' => 'Treble Clef Notes', 'type' => 'note-reading', 'options' => ['clef' => 'treble'], 'level' => 'Beginner', 'icon' => '🎼', 'description' => 'Name notes on the treble staff, including ledger lines.'],
    'bass-notes' => ['title' => 'Bass Clef Notes', 'type' => 'note-reading', 'options' => ['clef' => 'bass'], 'level' => 'Beginner', 'icon' => '🎵', 'description' => 'Name notes on the bass staff, down to low E.'],
    'grand-staff' => ['title' => 'Grand Staff Mix', 'type' => 'note-reading', 'options' => ['clef' => 'both'], 'level' => 'Intermediate', 'icon' => '🎹', 'description' => 'Treble and bass mixed together, like real piano music.'],
    'find-the-key' => ['title' => 'Find the Key', 'type' => 'staff-to-key', 'options' => [], 'level' => 'Beginner', 'icon' => '👆', 'description' => 'See a note on the staff, then tap it on the keyboard.'],
    'name-the-key' => ['title' => 'Name the Key', 'type' => 'key-naming', 'options' => [], 'level' => 'Beginner', 'icon' => '🔤', 'description' => 'A piano key lights up. What is its name? Sharps and flats included.'],
    'intervals' => ['title' => 'Reading Intervals', 'type' => 'interval-reading', 'options' => [], 'level' => 'Intermediate', 'icon' => '📏', 'description' => 'Count the distance between two notes on the staff (2nd to octave).'],
    'key-signatures' => ['title' => 'Key Signatures', 'type' => 'key-signature', 'options' => [], 'level' => 'Intermediate', 'icon' => '♯', 'description' => 'Identify the major key from its sharps or flats.'],
    'note-values' => ['title' => 'Note Values', 'type' => 'note-values', 'options' => [], 'level' => 'Beginner', 'icon' => '⏱️', 'description' => 'How many beats does each note get in 4/4 time?'],
    'higher-lower' => ['title' => 'Higher or Lower?', 'type' => 'higher-lower', 'options' => [], 'level' => 'Beginner', 'icon' => '👂', 'description' => 'Ear training: is the second note higher, lower or the same?'],
    'ear-intervals' => ['title' => 'Hear the Interval', 'type' => 'ear-interval', 'options' => [], 'level' => 'Advanced', 'icon' => '🎧', 'description' => 'Ear training: listen to two notes and name the interval.'],
    'musical-terms' => ['title' => 'Musical Terms', 'type' => 'terms', 'options' => [], 'level' => 'Intermediate', 'icon' => '📖', 'description' => 'Italian tempo and dynamics words — allegro, forte, and friends.'],
];
