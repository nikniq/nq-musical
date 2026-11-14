/* Note Quest quiz engine — no build step required.
 * Each quiz `type` (see config/quizzes.php) maps to a generator in GENERATORS
 * that returns a question: { prompt, render(stage), choices | keyboard, answer, sound? }.
 */
(function () {
  'use strict';

  const TOTAL = 10;
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const LETTER_SEMIS = [0, 2, 4, 5, 7, 9, 11];
  const PC_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
  const SVGNS = 'http://www.w3.org/2000/svg';

  // ---------- helpers ----------
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Diatonic index: C0 = 0, D0 = 1 ... C4 = 28.
  const diaToLetter = (d) => LETTERS[((d % 7) + 7) % 7];
  const diaToMidi = (d, acc = 0) => 12 * (Math.floor(d / 7) + 1) + LETTER_SEMIS[((d % 7) + 7) % 7] + acc;
  // Build multiple-choice options with `answer` plus distractors drawn from `pool`.
  const options = (answer, pool, n = 4) => shuffle([answer, ...shuffle(pool.filter((p) => p !== answer)).slice(0, n - 1)]);
  const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text !== undefined) e.textContent = text; return e; };
  const svg = (tag, attrs = {}, text) => { const e = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text !== undefined) e.textContent = text; return e; };

  // ---------- audio ----------
  let ctx = null;
  function playMidi(midis, { gap = 0.7, dur = 0.9 } = {}) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const t0 = ctx.currentTime + 0.05;
      [].concat(midis).forEach((m, i) => {
        const freq = 440 * Math.pow(2, (m - 69) / 12);
        const start = t0 + i * gap;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        gain.connect(ctx.destination);
        // Two partials give a softer, more piano-ish tone than a bare sine.
        [[1, 'triangle', 1], [2, 'sine', 0.3]].forEach(([mult, type, lvl]) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = type; o.frequency.value = freq * mult; g.gain.value = lvl;
          o.connect(g); g.connect(gain); o.start(start); o.stop(start + dur + 0.05);
        });
      });
    } catch (e) { /* audio unavailable */ }
  }

  // ---------- staff drawing ----------
  const STAFF = { top: 50, gap: 12 };
  const BOTTOM = STAFF.top + STAFF.gap * 4;
  const CLEF_BASE = { treble: 30, bass: 18 }; // diatonic index of bottom line (E4 / G2)
  const SHARP_POS = [38, 35, 39, 36, 33, 37, 34]; // treble: F C G D A E B
  const FLAT_POS = [34, 37, 33, 36, 32, 35, 31];  // treble: B E A D G C F

  function staffSVG({ clef, notes = [], keySig = 0, width = 280, stems = true }) {
    const base = CLEF_BASE[clef];
    const y = (d) => BOTTOM - (d - base) * (STAFF.gap / 2);
    const s = svg('svg', { viewBox: `0 0 ${width} 160`, width, height: 160, role: 'img', 'aria-label': `${clef} staff` });
    for (let i = 0; i < 5; i++) s.appendChild(svg('line', { x1: 6, x2: width - 6, y1: STAFF.top + i * STAFF.gap, y2: STAFF.top + i * STAFF.gap, class: 'staff-line' }));
    s.appendChild(svg('line', { x1: width - 6, x2: width - 6, y1: STAFF.top, y2: BOTTOM, class: 'staff-line' }));
    if (clef === 'treble') s.appendChild(svg('text', { x: 8, y: BOTTOM + 14, 'font-size': 76, class: 'staff-note' }, '𝄞'));
    else s.appendChild(svg('text', { x: 10, y: STAFF.top + 34, 'font-size': 44, class: 'staff-note' }, '𝄢'));

    const shift = clef === 'bass' ? -14 : 0;
    const sigPos = keySig > 0 ? SHARP_POS : FLAT_POS;
    for (let i = 0; i < Math.abs(keySig); i++) {
      s.appendChild(svg('text', { x: 62 + i * 13, y: y(sigPos[i] + shift) + (keySig > 0 ? 6 : 4), 'font-size': 26, class: 'staff-note', 'text-anchor': 'middle' }, keySig > 0 ? '♯' : '♭'));
    }

    notes.forEach(({ d, x = width / 2 + 20 }) => {
      const ny = y(d);
      for (let k = base - 2; k >= d; k -= 2) s.appendChild(svg('line', { x1: x - 13, x2: x + 13, y1: y(k), y2: y(k), class: 'staff-line' }));
      for (let k = base + 10; k <= d; k += 2) s.appendChild(svg('line', { x1: x - 13, x2: x + 13, y1: y(k), y2: y(k), class: 'staff-line' }));
      s.appendChild(svg('ellipse', { cx: x, cy: ny, rx: 7.5, ry: 5.5, transform: `rotate(-20 ${x} ${ny})`, class: 'staff-note' }));
      if (stems) {
        const up = d < base + 4;
        const sx = up ? x + 6.5 : x - 6.5;
        s.appendChild(svg('line', { x1: sx, x2: sx, y1: ny, y2: up ? ny - 36 : ny + 36, stroke: 'currentColor', 'stroke-width': 1.6, class: 'staff-line' }));
      }
    });
    return s;
  }

  // ---------- keyboard drawing ----------
  // Two octaves from C4 (midi 60) to B5 (midi 83).
  function keyboardSVG({ start = 60, octaves = 2, highlight = null, onPick = null }) {
    const W = 36, H = 140, BW = 22, BH = 88, whites = octaves * 7;
    const s = svg('svg', { viewBox: `0 0 ${whites * W + 2} ${H + 2}`, width: whites * W + 2, height: H + 2, class: 'kb' + (onPick ? ' clickable' : ''), role: 'img', 'aria-label': 'piano keyboard' });
    const keys = {};
    const add = (midi, attrs, cls) => {
      const r = svg('rect', { ...attrs, class: `key ${cls}` + (midi === highlight ? ' hl' : ''), 'data-midi': midi });
      if (onPick) r.addEventListener('click', () => onPick(midi, r));
      keys[midi] = r; return r;
    };
    const blackLayer = [];
    for (let i = 0; i < whites; i++) {
      const oct = Math.floor(i / 7), li = i % 7, midi = start + oct * 12 + LETTER_SEMIS[li];
      s.appendChild(add(midi, { x: i * W + 1, y: 1, width: W, height: H, rx: 4 }, 'white'));
      if (li === 0 && oct === 0) s.appendChild(svg('text', { x: i * W + W / 2 + 1, y: H - 10, 'font-size': 11, 'text-anchor': 'middle', fill: '#999', 'pointer-events': 'none' }, 'C4'));
      if ([0, 1, 3, 4, 5].includes(li)) blackLayer.push(add(midi + 1, { x: (i + 1) * W + 1 - BW / 2, y: 1, width: BW, height: BH, rx: 3 }, 'black'));
    }
    blackLayer.forEach((b) => s.appendChild(b));
    s.keys = keys;
    return s;
  }

  // ---------- note-value drawing ----------
  function noteValueSVG({ filled, stem, flags, dot }) {
    const s = svg('svg', { viewBox: '0 0 120 120', width: 120, height: 120, role: 'img', 'aria-label': 'note symbol' });
    const cx = 50, cy = 90;
    s.appendChild(svg('ellipse', { cx, cy, rx: 13, ry: 9, transform: `rotate(-20 ${cx} ${cy})`, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': 3, class: 'staff-note' }));
    if (stem) {
      s.appendChild(svg('line', { x1: cx + 12, x2: cx + 12, y1: cy - 3, y2: 20, stroke: 'currentColor', 'stroke-width': 3, class: 'staff-line' }));
      for (let f = 0; f < flags; f++) s.appendChild(svg('path', { d: `M${cx + 12} ${20 + f * 14} q 22 12 14 36`, fill: 'none', stroke: 'currentColor', 'stroke-width': 4, class: 'staff-line' }));
    }
    if (dot) s.appendChild(svg('circle', { cx: cx + 26, cy: cy - 2, r: 4, class: 'staff-note' }));
    return s;
  }

  // ---------- question generators ----------
  const RANGES = { treble: [28, 42], bass: [16, 28] }; // C4–C6, E2–C4
  let lastKey = null;
  const fresh = (gen) => { let v, tries = 0; do { v = gen(); } while (v === lastKey && tries++ < 10); lastKey = v; return v; };

  const NOTE_VALUES = [
    { name: 'Whole note', beats: '4 beats', filled: false, stem: false, flags: 0 },
    { name: 'Half note', beats: '2 beats', filled: false, stem: true, flags: 0 },
    { name: 'Dotted half note', beats: '3 beats', filled: false, stem: true, flags: 0, dot: true },
    { name: 'Quarter note', beats: '1 beat', filled: true, stem: true, flags: 0 },
    { name: 'Dotted quarter note', beats: '1½ beats', filled: true, stem: true, flags: 0, dot: true },
    { name: 'Eighth note', beats: '½ beat', filled: true, stem: true, flags: 1 },
    { name: 'Sixteenth note', beats: '¼ beat', filled: true, stem: true, flags: 2 },
  ];

  const MAJOR_KEYS = { 0: 'C major', 1: 'G major', 2: 'D major', 3: 'A major', 4: 'E major', 5: 'B major', 6: 'F♯ major', 7: 'C♯ major', '-1': 'F major', '-2': 'B♭ major', '-3': 'E♭ major', '-4': 'A♭ major', '-5': 'D♭ major', '-6': 'G♭ major', '-7': 'C♭ major' };

  const INTERVALS = ['Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Octave'];
  const ORDINALS = ['', '', '2nd', '3rd', '4th', '5th', '6th', '7th', 'Octave'];

  const TERMS = [
    ['Largo', 'Very slow and broad'], ['Adagio', 'Slow'], ['Andante', 'At a walking pace'], ['Moderato', 'Moderate speed'],
    ['Allegro', 'Fast and lively'], ['Presto', 'Very fast'], ['Ritardando', 'Gradually slowing down'], ['Accelerando', 'Gradually speeding up'],
    ['A tempo', 'Return to the original speed'], ['Piano', 'Soft'], ['Forte', 'Loud'], ['Mezzo forte', 'Moderately loud'],
    ['Pianissimo', 'Very soft'], ['Fortissimo', 'Very loud'], ['Crescendo', 'Gradually getting louder'], ['Diminuendo', 'Gradually getting softer'],
    ['Legato', 'Smooth and connected'], ['Staccato', 'Short and detached'], ['Fermata', 'Hold the note longer'], ['Dolce', 'Sweetly'],
    ['Cantabile', 'In a singing style'], ['Da capo (D.C.)', 'Go back to the beginning'], ['Fine', 'The end'], ['Sforzando', 'Sudden strong accent'],
  ];

  const GENERATORS = {
    'note-reading'(opts) {
      const clef = opts.clef === 'both' ? pick(['treble', 'bass']) : opts.clef;
      const [lo, hi] = RANGES[clef];
      const d = fresh(() => lo + rand(hi - lo + 1));
      return {
        prompt: 'What is the name of this note?',
        render: (st) => st.appendChild(staffSVG({ clef, notes: [{ d }] })),
        choices: LETTERS.map((l) => ({ label: l, value: l })),
        answer: diaToLetter(d),
        sound: [diaToMidi(d)],
      };
    },

    'staff-to-key'() {
      const d = fresh(() => 28 + rand(14)); // C4–B5, matches the keyboard
      return {
        prompt: 'Tap this note on the keyboard.',
        render: (st) => st.appendChild(staffSVG({ clef: 'treble', notes: [{ d }] })),
        keyboard: true,
        answer: diaToMidi(d),
        answerLabel: diaToLetter(d) + Math.floor(d / 7),
        sound: [diaToMidi(d)],
      };
    },

    'key-naming'() {
      const midi = fresh(() => 60 + rand(24));
      return {
        prompt: 'What is the name of the highlighted key?',
        render: (st) => st.appendChild(keyboardSVG({ highlight: midi })),
        choices: PC_NAMES.map((n) => ({ label: n, value: n })),
        answer: PC_NAMES[midi % 12],
        sound: [midi],
      };
    },

    'interval-reading'() {
      const clef = pick(['treble', 'bass']);
      const [lo] = RANGES[clef];
      const size = 1 + rand(7); // steps: 1 => 2nd ... 7 => octave
      const d1 = fresh(() => lo + 2 + rand(8));
      const d2 = d1 + size;
      return {
        prompt: 'What is the interval between these notes?',
        render: (st) => st.appendChild(staffSVG({ clef, notes: [{ d: d1, x: 140 }, { d: d2, x: 210 }], width: 280 })),
        choices: ORDINALS.slice(2).map((o) => ({ label: o, value: o })),
        answer: ORDINALS[size + 1],
        sound: [diaToMidi(d1), diaToMidi(d2)],
      };
    },

    'key-signature'() {
      const n = fresh(() => rand(15) - 7);
      const clef = pick(['treble', 'bass']);
      const answer = MAJOR_KEYS[n];
      return {
        prompt: 'Which major key has this key signature?',
        render: (st) => st.appendChild(staffSVG({ clef, keySig: n, width: 200 })),
        choices: options(answer, Object.values(MAJOR_KEYS)).map((k) => ({ label: k, value: k })),
        answer,
      };
    },

    'note-values'() {
      const nv = NOTE_VALUES[fresh(() => rand(NOTE_VALUES.length))];
      const pool = [...new Set(NOTE_VALUES.map((v) => v.beats))];
      return {
        prompt: 'In 4/4 time, how many beats is this note worth?',
        render: (st) => st.appendChild(noteValueSVG(nv)),
        choices: options(nv.beats, pool).map((b) => ({ label: b, value: b })),
        answer: nv.beats,
        explain: nv.name,
      };
    },

    'higher-lower'() {
      const a = 55 + rand(20);
      const diff = pick([-7, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 7]);
      const b = a + diff;
      const answer = diff > 0 ? 'Higher' : diff < 0 ? 'Lower' : 'Same';
      return {
        prompt: 'Listen. Is the second note higher, lower or the same?',
        listen: [a, b],
        choices: ['Lower', 'Same', 'Higher'].map((x) => ({ label: x, value: x })),
        answer,
        sound: [a, b],
      };
    },

    'ear-interval'() {
      const semis = fresh(() => pick([2, 3, 4, 5, 7, 9, 12]));
      const a = 55 + rand(13);
      const pool = [2, 3, 4, 5, 7, 9, 12].map((i) => INTERVALS[i]);
      return {
        prompt: 'Listen. Which interval do you hear?',
        listen: [a, a + semis],
        choices: options(INTERVALS[semis], pool).map((x) => ({ label: x, value: x })),
        answer: INTERVALS[semis],
        sound: [a, a + semis],
      };
    },

    terms() {
      const [term, meaning] = TERMS[fresh(() => rand(TERMS.length))];
      return {
        prompt: 'What does this term mean?',
        render: (st) => st.appendChild(el('div', { class: 'term' }, term)),
        choices: options(meaning, TERMS.map((t) => t[1])).map((m) => ({ label: m, value: m })),
        answer: meaning,
      };
    },
  };

  // ---------- engine ----------
  function start(root) {
    const type = root.dataset.type;
    const opts = JSON.parse(root.dataset.options || '{}');
    const slug = root.dataset.slug;
    const gen = GENERATORS[type];
    if (!gen) { root.appendChild(el('p', {}, 'Unknown quiz type.')); return; }

    const box = el('div');
    root.appendChild(box);
    let index = 0, score = 0, streak = 0, bestStreak = 0;

    function next() {
      box.innerHTML = '';
      if (index >= TOTAL) return summary();
      const q = gen(opts);

      const prog = el('div', { class: 'progress' });
      prog.append(el('span', {}, `Question ${index + 1} / ${TOTAL}`), el('span', {}, `Score ${score}` + (streak > 1 ? ` · 🔥 ${streak}` : '')));
      const bar = el('div', { class: 'bar' }); const fill = el('div'); fill.style.width = (index / TOTAL) * 100 + '%'; bar.appendChild(fill);
      const stage = el('div', { class: 'stage' });
      const feedback = el('div', { class: 'feedback', 'aria-live': 'polite' });
      const actions = el('div', { class: 'actions' });
      box.append(prog, bar, el('div', { class: 'prompt' }, q.prompt), stage);

      if (q.render) q.render(stage);
      if (q.listen) {
        const play = el('button', { class: 'btn primary', type: 'button' }, '▶ Play notes');
        play.addEventListener('click', () => playMidi(q.listen));
        stage.appendChild(play);
        playMidi(q.listen);
      }

      let answered = false;
      const finish = (correct, answerText) => {
        answered = true;
        if (correct) { score++; streak++; bestStreak = Math.max(bestStreak, streak); }
        else streak = 0;
        feedback.className = 'feedback ' + (correct ? 'ok' : 'bad');
        feedback.textContent = (correct ? pick(['Correct! 🎉', 'Well done! ⭐', 'Nice! 👏', 'You got it! 🎶']) : `Not quite — the answer is ${answerText}.`) + (q.explain ? ` (${q.explain})` : '');
        if (q.sound && !q.listen) playMidi(q.sound, { gap: 0.5 });
        index++;
        const nb = el('button', { class: 'btn primary', type: 'button' }, index >= TOTAL ? 'See results' : 'Next →');
        nb.addEventListener('click', next);
        actions.appendChild(nb);
        if (q.listen) { const again = el('button', { class: 'btn', type: 'button' }, '🔁 Hear again'); again.addEventListener('click', () => playMidi(q.listen)); actions.appendChild(again); }
        nb.focus();
      };

      if (q.keyboard) {
        const kb = keyboardSVG({
          onPick: (midi, rect) => {
            if (answered) return;
            const ok = midi === q.answer;
            rect.classList.add(ok ? 'correct' : 'wrong');
            if (!ok) kb.keys[q.answer].classList.add('correct');
            finish(ok, q.answerLabel);
          },
        });
        const wrap = el('div', { class: 'stage' }); wrap.appendChild(kb); box.appendChild(wrap);
      } else {
        const choices = el('div', { class: 'choices' });
        const buttons = q.choices.map((c) => {
          const b = el('button', { class: 'btn', type: 'button' }, c.label);
          b.addEventListener('click', () => {
            if (answered) return;
            const ok = c.value === q.answer;
            b.classList.add(ok ? 'correct' : 'wrong');
            buttons.forEach((x, i) => { x.disabled = true; if (q.choices[i].value === q.answer) x.classList.add('correct'); });
            finish(ok, q.answer);
          });
          return b;
        });
        choices.append(...buttons);
        box.appendChild(choices);
      }
      box.append(feedback, actions);
    }

    function summary() {
      let best = score;
      try {
        const key = 'nq-best-' + slug;
        best = Math.max(score, Number(localStorage.getItem(key) || 0));
        localStorage.setItem(key, best);
      } catch (e) {}
      const pct = score / TOTAL;
      const msg = pct === 1 ? 'Perfect score! 🏆' : pct >= 0.8 ? 'Excellent work! 🌟' : pct >= 0.5 ? 'Good effort — keep practising! 🎹' : 'Practice makes perfect — try again! 💪';
      const s = el('div', { class: 'summary' });
      s.append(el('div', { class: 'big' }, `${score} / ${TOTAL}`), el('p', {}, msg), el('p', { class: 'muted' }, `Best streak: ${bestStreak} · Personal best: ${best}/${TOTAL}`));
      const actions = el('div', { class: 'actions' });
      const again = el('button', { class: 'btn primary', type: 'button' }, 'Play again');
      again.addEventListener('click', () => { index = 0; score = 0; streak = 0; bestStreak = 0; next(); });
      const home = el('a', { class: 'btn', href: '/' }, 'All quizzes');
      actions.append(again, home);
      s.appendChild(actions);
      box.appendChild(s);
    }

    next();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('quiz');
    if (root) start(root);
  });
})();
