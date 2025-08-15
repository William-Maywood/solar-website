// --- Tabs & marquee support (unchanged) ---
function setActiveButtons(tabId) {
  // Activate ALL matching copies (because the track is duplicated)
  const matches = document.querySelectorAll(`.tab[data-tab="${tabId}"]`);
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  if (matches.length) {
    matches.forEach(b => b.classList.add('active'));
  } else {
    // Fallback for older markup
    const btn = document.querySelector(`button[onclick="showTab('${tabId}')"]`);
    if (btn) btn.classList.add('active');
  }
}

function showTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-content').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none'; // keep compatibility with your CSS
  });

  // Show requested panel
  const panel = document.getElementById(tabId);
  if (panel) {
    panel.classList.add('active');
    panel.style.display = 'block';
  }

  // Update tab button(s)
  setActiveButtons(tabId);

  // Reset quiz when leaving the quiz tab
  if (tabId !== 'quiz') resetQuiz();

  // Update URL hash without scrolling
  if (history.replaceState) history.replaceState(null, '', `#${tabId}`);
}

// Duplicate the tabs enough times so translating -50% is always full-width
function initMarqueeTabs(){
  const viewport = document.querySelector('.tabs-viewport');
  const track = document.getElementById('tabsTrack');
  if (!viewport || !track) return;

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
    return;
  }

  if (track.dataset.duplicated === 'true') return;

  const oneCopy = track.innerHTML;
  let safety = 12; // prevents infinite loops

  // Ensure the track is at least 2× viewport width (for seamless 0% -> -50% loop)
  while (track.scrollWidth < viewport.offsetWidth * 2 && safety-- > 0) {
    track.insertAdjacentHTML('beforeend', oneCopy);
  }
  track.dataset.duplicated = 'true';
}

// --- Power quiz logic (unchanged) ---
function submitQuiz() {
  const answers = {
    q1: "D", q2: "B", q3: "C", q4: "D", q5: "B",
    q6: "C", q7: "C", q8: "C", q9: "B"
  };

  let score = 0;

  for (const q in answers) {
    const selected = document.querySelector(`input[name="${q}"]:checked`);
    const feedback = document.getElementById(`${q}_feedback`);
    if (!feedback) continue;

    if (selected && selected.value === answers[q]) {
      feedback.textContent = " ✅";
      feedback.style.color = "green";
      score++;
    } else {
      feedback.textContent = " ❌ 🥀 wrong";
      feedback.style.color = "red";
    }
  }

  const result = document.getElementById("quizResult");
  if (result) result.textContent = `✅ You got ${score} out of 9 correct.`;
}

function resetQuiz() {
  const form = document.getElementById("quizForm");
  if (form) form.reset();

  const result = document.getElementById("quizResult");
  if (result) result.textContent = "";

  document.querySelectorAll(".feedback").forEach(fb => {
    fb.textContent = "";
    fb.style.color = "";
  });
}

// --- ADDED: Shared quiz helpers for Solar/BESS pages (standalone) ---
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const A = [...a].sort(), B = [...b].sort();
  return A.every((v, i) => v === B[i]);
}

// Grade a quiz module by key, e.g. data-quiz="solar" or "bess"
function gradeModule(key) {
  const form = document.querySelector(`form[data-quiz="${key}"]`);
  if (!form) return;

  const questions = form.querySelectorAll('.question');
  let correct = 0, total = questions.length;

  questions.forEach(q => {
    const type = q.dataset.type;
    const fb = q.querySelector('.feedback');
    if (fb) fb.className = 'feedback'; // reset
    let ok = false;

    if (type === 'single' || type === 'tf') {
      // radio in the same question fieldset
      const checked = q.querySelector('input[type="radio"]:checked');
      ok = !!checked && checked.value === q.dataset.answer;
    } else if (type === 'multi') {
      const selected = [...q.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
      const ans = q.dataset.answer.split(',').map(s => s.trim());
      ok = arraysEqual(selected, ans);
    }

    if (fb) {
      if (ok) { fb.textContent = ' ✅ correct'; fb.classList.add('ok'); }
      else { fb.textContent = ' ❌ try again'; fb.classList.add('bad'); }
    }
    if (ok) correct++;
  });

  const scoreEl = document.getElementById(`score-${key}`);
  if (scoreEl) scoreEl.textContent = `Score: ${correct} / ${total}`;
}

function resetModule(key) {
  const form = document.querySelector(`form[data-quiz="${key}"]`);
  if (!form) return;
  form.reset();
  form.querySelectorAll('.feedback').forEach(f => { f.textContent = ''; f.className = 'feedback'; });
  form.querySelectorAll('label.choice').forEach(l => l.style.outline = '');
  const scoreEl = document.getElementById(`score-${key}`);
  if (scoreEl) scoreEl.textContent = 'Score: —';
}

function revealModule(key) {
  const form = document.querySelector(`form[data-quiz="${key}"]`);
  if (!form) return;
  form.querySelectorAll('.question').forEach(q => {
    const type = q.dataset.type;
    const ans = q.dataset.answer.split(',').map(s => s.trim());
    q.querySelectorAll('label.choice').forEach(lab => {
      const input = lab.querySelector('input');
      lab.style.outline = '';
      const should = (type === 'multi' && ans.includes(input.value)) ||
                     (type !== 'multi' && input.value === ans[0]);
      if (should) lab.style.outline = '2px solid var(--pri)';
    });
  });
}

// Auto-wire buttons on Solar/BESS pages if present
function wireModuleControls() {
  document.querySelectorAll('.controls button').forEach(btn => {
    const action = btn.dataset.action;
    const key = btn.dataset.target;
    if (!action || !key) return;
    btn.addEventListener('click', () => {
      if (action === 'grade') gradeModule(key);
      if (action === 'reset') resetModule(key);
      if (action === 'reveal') revealModule(key);
    });
  });
}

// --- Enhancements ---
// Keep tabs in sync with browser navigation (back/forward)
window.addEventListener('hashchange', () => {
  const next = (location.hash || '#home').replace('#', '');
  showTab(next);
});

// --- Init ---
window.addEventListener('DOMContentLoaded', () => {
  // Main portal init (safe to run on quiz pages too)
  initMarqueeTabs();
  const initial = (location.hash || '#home').replace('#','');
  if (document.getElementById(initial)) showTab(initial);

  // If we're on a Solar/BESS quiz page, wire its controls
  wireModuleControls();
});

// Expose functions for inline handlers (power quiz + tabs)
window.showTab = showTab;
window.submitQuiz = submitQuiz;
window.resetQuiz = resetQuiz;

// (Optional) also expose module helpers if you want to call them manually
window.gradeModule = gradeModule;
window.resetModule = resetModule;
window.revealModule = revealModule;
