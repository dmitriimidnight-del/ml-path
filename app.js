(function () {
  "use strict";

  var PATH = window.PATH;
  var KEY = "mlpath.v1";
  var app = document.getElementById("app");
  var memory = null; // запасное хранилище, если localStorage недоступен

  // ---------- состояние ----------

  function emptyState() {
    return { tasks: {}, criteria: {}, quiz: {}, repo: {}, review: {}, settings: {}, diag: {}, log: {}, active: {}, termsAdded: {}, drills: {}, exams: {}, repoCheck: {}, notes: {}, interview: {}, read: {}, pos: {}, py: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) { /* хранилище недоступно */ }
    return memory || emptyState();
  }

  // синхронизация (настройки и токен хранятся отдельно и в код прогресса не попадают)
  var SYNC_KEY = "mlpath.sync", SYNC_FILE = "progress.json";
  var syncTimer = null, syncing = false, applyingRemote = false, changeCount = 0, lastPull = 0;

  function save() {
    memory = state;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* остаёмся в памяти */ }
    if (!applyingRemote) markDirty();
  }

  var state = load();

  // ---------- утилиты ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Текст урока: экранируем и превращаем `код` в <code>
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function project(id) {
    for (var i = 0; i < PATH.projects.length; i++) {
      if (PATH.projects[i].id === id) return PATH.projects[i];
    }
    return null;
  }

  function isIntro(p) { return p.kind === "intro"; }
  function hasPlan(p) { return !!p.plan; }
  function hasLessons(p) { return !!p.theory; }
  function realProjects() { return PATH.projects.filter(function (p) { return !isIntro(p); }); }
  function projectNumber(p) { return realProjects().indexOf(p) + 1; }

  function qKey(p, t, qi) { return p.id + "." + t.id + ".q" + qi; }
  function tKey(p, wi, ti) { return p.id + ".w" + wi + ".t" + ti; }

  function lessonScore(p, t) {
    var right = t.quiz.filter(function (q, qi) { return state.quiz[qKey(p, t, qi)] === q.answer; }).length;
    return { right: right, total: t.quiz.length };
  }

  function progress(p) {
    var done = 0, total = 0;
    (p.theory || []).forEach(function (t) {
      var s = lessonScore(p, t);
      done += s.right; total += s.total;
    });
    (p.plan || []).forEach(function (w, wi) {
      w.tasks.forEach(function (_, ti) { total++; if (state.tasks[tKey(p, wi, ti)]) done++; });
    });
    (p.criteria || []).forEach(function (_, ci) { total++; if (state.criteria[p.id + ".c" + ci]) done++; });
    return { done: done, total: total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function nextStep() {
    for (var i = 0; i < PATH.projects.length; i++) {
      var p = PATH.projects[i];
      if (isIntro(p)) {
        if (progress(p).pct < 100) {
          return { href: "#" + p.id, text: "Пройти вводный урок «" + p.title + "»", meta: "Старт · " + p.weeks };
        }
        continue;
      }
      if (!hasPlan(p)) continue;
      for (var wi = 0; wi < p.plan.length; wi++) {
        for (var ti = 0; ti < p.plan[wi].tasks.length; ti++) {
          if (!state.tasks[tKey(p, wi, ti)]) {
            return { href: "#" + p.id + "/plan", text: p.plan[wi].tasks[ti], meta: p.title + " · " + p.plan[wi].title };
          }
        }
      }
    }
    return null;
  }

  function bar(pct, label) {
    return '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct +
      '" aria-label="' + esc(label) + '"><span style="width:' + pct + '%"></span></div>';
  }

  // ---------- главная ----------

  // ---------- офлайн ----------

  var offlineBusy = false;

  async function pythonCached() {
    if (!window.caches) return false;
    try {
      var cache = await caches.open("mlpath-pyodide");
      var keys = await cache.keys();
      var urls = keys.map(function (r) { return r.url; });
      var has = function (part) { return urls.some(function (u) { return u.indexOf(part) !== -1; }); };
      return has("pyodide.asm.wasm") && has("pandas") && has("scikit_learn") && has("matplotlib");
    } catch (e) { return false; }
  }

  async function storageUsed() {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    var est = await navigator.storage.estimate();
    return Math.round((est.usage || 0) / 1048576);
  }

  async function refreshOffline(message) {
    var panel = document.getElementById("offline-panel");
    if (!panel) return;
    var swOk = "serviceWorker" in navigator;
    var py = await pythonCached();
    var used = await storageUsed();
    panel = document.getElementById("offline-panel");
    if (!panel) return;
    var h = '<h2>Без интернета</h2>';
    if (!navigator.onLine) h += '<p class="run-diff">Сейчас нет интернета.</p>';
    h += '<p>' + (swOk ? '✓ Уроки, квизы, графики и прогресс работают без интернета.' :
      'Этот браузер не умеет работать без интернета.') + '</p>';
    if (py) {
      h += '<p>✓ Python скачан: кнопка «Запустить» работает без интернета.</p>';
    } else {
      h += '<p>Python ещё не скачан. Скачай его один раз при Wi-Fi, и примеры будут запускаться без сети.</p>';
      h += '<button type="button" class="run-btn" data-act="offline-download"' + (offlineBusy || !navigator.onLine ? ' disabled' : '') +
        '>Скачать Python для офлайна</button>';
    }
    if (message) h += '<p class="run-status">' + esc(message) + '</p>';
    if (used !== null) h += '<p class="hint">Приложение занимает на устройстве около ' + used + ' МБ.</p>';
    panel.innerHTML = h;
  }

  async function downloadOffline() {
    if (offlineBusy || !window.Runner) return;
    offlineBusy = true;
    refreshOffline("Начинаю загрузку…");
    try {
      if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
      await window.Runner.preload(function (text) { refreshOffline(text); });
      offlineBusy = false;
      var ok = await pythonCached();
      refreshOffline(ok ? "Готово. Теперь Python работает без интернета." :
        "Python загрузился, но не сохранился для офлайна. Закрой приложение, открой снова и попробуй ещё раз.");
    } catch (e) {
      offlineBusy = false;
      refreshOffline("Не получилось скачать. Проверь интернет и попробуй ещё раз.");
    }
  }

  window.addEventListener("online", function () { refreshOffline(); });
  window.addEventListener("offline", function () { refreshOffline(); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* без офлайна, но приложение работает */ });
    });
  }

  function viewHome() {
    var real = realProjects();
    var finished = real.filter(function (p) { return hasPlan(p) && progress(p).pct === 100; }).length;
    var next = nextStep();

    var h = '';
    h += '<header class="hero">';
    h += '<p class="eyebrow">' + finished + ' из ' + real.length + ' проектов в портфолио</p>';
    h += '<h1>' + esc(PATH.title) + '</h1>';
    h += '<p class="lead">' + esc(PATH.subtitle) + '</p>';
    h += '</header>';

    h += diagInvite();
    h += continueCard();
    h += pyHomeCard();

    if (next) {
      h += '<a class="next" href="' + next.href + '">';
      h += '<span class="next-label">Следующий шаг</span>';
      h += '<span class="next-text">' + esc(next.text) + '</span>';
      h += '<span class="next-meta">' + esc(next.meta) + '</span>';
      h += '</a>';
    }

    h += reviewCard();
    h += weekCard();

    h += '<ol class="ladder">';
    PATH.projects.forEach(function (p) {
      var pr = progress(p);
      var tracked = pr.total > 0;
      h += '<li><a class="step" href="#' + p.id + '">';
      h += '<span class="num' + (isIntro(p) ? ' num-start' : '') + '">' + (isIntro(p) ? '0' : projectNumber(p)) + '</span>';
      h += '<span class="step-body">';
      h += '<span class="step-title">' + esc(p.title) + '</span>';
      h += '<span class="step-tag">' + esc(p.tagline) + '</span>';
      h += '<span class="step-meta">' + esc(p.weeks) + (tracked ? ' · ' + pr.pct + '%' : '') +
        (state.exams[p.id] && state.exams[p.id].passed ? ' · контрольная ✓' : '') + '</span>';
      if (tracked) h += bar(pr.pct, 'Прогресс: ' + p.title);
      h += '</span></a></li>';
    });
    h += '</ol>';

    var nNotes = Object.keys(state.notes).filter(function (k) { return state.notes[k].text.trim(); }).length;
    h += '<nav class="tools"><a href="#python">Тренажёр Python</a><a href="#glossary">Словарь терминов</a><a href="#diagnostic">' +
      (state.diag.done ? 'Диагностика: ' + diagScore().right + ' из ' + diagScore().total : 'Диагностика по Python') + '</a>' +
      '<a href="#interview">Тренажёр собеседования</a><a href="#notes">Мои заметки' + (nNotes ? ' · ' + nNotes : '') + '</a></nav>';

    h += '<section class="offline" id="offline-panel" aria-live="polite"></section>';

    h += syncPanelHtml();
    h += '<details class="sync"><summary>Перенести прогресс кодом, без GitHub</summary>';
    h += '<p>Прогресс хранится в браузере на этом устройстве. Чтобы продолжить на другом, скопируй код здесь и вставь его там.</p>';
    h += '<textarea id="sync-box" rows="3" spellcheck="false" aria-label="Код прогресса"></textarea>';
    h += '<div class="row"><button type="button" data-act="export">Показать мой код</button>';
    h += '<button type="button" data-act="import">Загрузить из кода</button></div>';
    h += '<p id="sync-msg" class="hint" role="status"></p>';
    h += '</details>';

    app.innerHTML = h;
    refreshOffline();
  }

  // ---------- проект ----------

  var TABS = [["brief", "Бриф"], ["theory", "Уроки"], ["plan", "План"], ["exam", "Контрольная"], ["ready", "Готовность"]];

  function viewProject(p, tab) {
    var pr = progress(p);
    var h = '';
    h += '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead">';
    h += '<p class="eyebrow">' + (isIntro(p) ? 'Старт' : 'Проект ' + projectNumber(p)) + ' · ' + esc(p.weeks) + '</p>';
    h += '<h1>' + esc(p.title) + '</h1>';
    h += '<p class="lead">' + esc(p.tagline) + '</p>';
    if (p.stack.length) h += '<ul class="chips">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (pr.total) h += bar(pr.pct, 'Прогресс') + '<p class="hint">' + pr.done + ' из ' + pr.total + ' пунктов</p>';
    h += '</header>';

    if (hasPlan(p)) {
      h += '<nav class="tabs" role="tablist">';
      TABS.forEach(function (t) {
        h += '<a role="tab" aria-selected="' + (tab === t[0]) + '" href="#' + p.id + '/' + t[0] + '">' + t[1] + '</a>';
      });
      h += '</nav>';
    }

    if (isIntro(p)) h += lessonListHtml(p);
    else if (!hasPlan(p) || tab === "brief") h += briefHtml(p);
    else if (tab === "theory") h += lessonListHtml(p);
    else if (tab === "plan") h += planHtml(p);
    else if (tab === "exam") h += examHtml(p);
    else if (tab === "ready") h += readyHtml(p);

    app.innerHTML = h;
  }

  function briefHtml(p) {
    var b = p.brief, h = '<section class="panel">';
    h += '<h2>Задача</h2><p>' + fmt(b.goal) + '</p>';
    if (b.questions) {
      h += '<h2>Вопросы, на которые отвечаешь</h2><ul class="plain">' +
        b.questions.map(function (q) { return '<li>' + fmt(q) + '</li>'; }).join('') + '</ul>';
    }
    h += '<h2>Что должно получиться</h2><ul class="plain">' +
      b.result.map(function (r) { return '<li>' + fmt(r) + '</li>'; }).join('') + '</ul>';
    if (b.data) h += '<h2>Данные</h2><p>' + fmt(b.data) + '</p>';
    if (b.note) h += '<p class="note">' + fmt(b.note) + '</p>';
    if (!hasPlan(p)) {
      h += '<p class="note">Уроки, недельный план и критерии готовности появятся здесь, когда будет закончен проект ' +
        (projectNumber(p) - 1) + '.</p>';
    }
    return h + '</section>';
  }

  function lessonListHtml(p) {
    var h = '<ol class="lessons">';
    p.theory.forEach(function (t, i) {
      var s = lessonScore(p, t);
      var done = s.right === s.total;
      h += '<li><a class="lesson' + (done ? ' done' : '') + '" href="#' + p.id + '/theory/' + t.id + '">';
      h += '<span class="lesson-n">' + (done ? '✓' : (i + 1)) + '</span>';
      h += '<span class="step-body"><span class="lesson-title">' + esc(t.title) + '</span>';
      h += '<span class="step-meta">' + esc(t.time) + ' · квиз ' + s.right + ' из ' + s.total + '</span>';
      var dl = diagLessonNote(p, t);
      if (dl) h += '<span class="diag-note ' + dl.cls + '">' + esc(dl.text) + '</span>';
      h += '</span>';
      h += '</a></li>';
    });
    return h + '</ol>';
  }

  // ---------- урок ----------

  function codeBlock(code, label) {
    return (label ? '<p class="code-label">' + label + '</p>' : '') + '<pre><code>' + esc(code) + '</code></pre>';
  }

  // ---------- запуск кода ----------

  var SHELL_WORDS = ["git ", "python ", "pip ", "cd ", ".venv", "source ", "docker ", "pytest", "fastapi ", "ruff "];
  var runMem = {};   // id блока -> { code, editing, out }
  var ranIds = {};   // id проекта -> { id блока: true } — что уже выполнено в памяти Python
  var running = false;

  function firstCodeLine(code) {
    var lines = code.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (l && l.charAt(0) !== "#") return l;
    }
    return "";
  }

  function sectionRunnable(s) { return !!s.code && !s.lang && !s.skip; }

  function practiceRunnable(x) {
    if (x.lang) return false;
    var first = firstCodeLine(x.solution);
    if (!first) return false;
    return !SHELL_WORDS.some(function (w) { return first.indexOf(w) === 0; });
  }

  function blockId(p, t, part) { return p.id + "|" + t.id + "|" + part; }

  function parseId(id) {
    var a = id.split("|");
    var p = project(a[0]);
    var t = p.theory.filter(function (x) { return x.id === a[1]; })[0];
    return { p: p, t: t, part: a[2] };
  }

  function originalCode(id) {
    var r = parseId(id);
    var kind = r.part.charAt(0), n = Number(r.part.slice(1));
    if (kind === "s") return r.t.sections[n].code;
    if (kind === "p") return r.t.practice[n].solution;
    return "";
  }

  // Примеры, которые должны выполниться до этого блока: всё раньше в проекте
  function prerequisites(id) {
    var r = parseId(id);
    var kind = r.part.charAt(0), n = Number(r.part.slice(1));
    var list = [];
    for (var li = 0; li < r.p.theory.length; li++) {
      var t = r.p.theory[li];
      for (var si = 0; si < t.sections.length; si++) {
        if (t === r.t && kind === "s" && si >= n) return list;
        if (sectionRunnable(t.sections[si])) {
          list.push({ id: blockId(r.p, t, "s" + si), code: t.sections[si].code, title: t.sections[si].h });
        }
      }
      if (t === r.t) return list;
    }
    return list;
  }

  function rows(code) { return Math.max(3, code.split("\n").length + 1); }

  var EDIT_ATTRS = ' spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"';

  function runBox(p, t, part, code) {
    var id = blockId(p, t, part);
    var m = runMem[id] || {};
    var current = m.code != null ? m.code : code;
    var h = '<div class="runbox" data-id="' + esc(id) + '">';
    h += '<pre class="code-view"' + (m.editing ? ' hidden' : '') + '><code>' + esc(current) + '</code></pre>';
    h += '<textarea class="code-edit" aria-label="Код примера"' + EDIT_ATTRS + ' rows="' + rows(current) + '"' +
      (m.editing ? '' : ' hidden') + '>' + esc(current) + '</textarea>';
    h += '<div class="run-actions">';
    h += '<button type="button" class="run-btn" data-act="run">▶ Запустить</button>';
    h += '<button type="button" class="ghost small" data-act="edit"' + (m.editing ? ' hidden' : '') + '>Изменить</button>';
    h += '<button type="button" class="ghost small" data-act="restore"' + (m.code != null ? '' : ' hidden') + '>Вернуть пример</button>';
    h += '</div>';
    h += '<div class="run-out" role="status"' + (m.out ? '' : ' hidden') + '>' + (m.out || '') + '</div>';
    return h + '</div>';
  }

  function userBox(p, t, i) {
    var id = blockId(p, t, "u" + i);
    var m = runMem[id] || {};
    var current = m.code || "";
    var h = '<div class="runbox user-box" data-id="' + esc(id) + '">';
    h += '<textarea class="code-edit" aria-label="Твоё решение" placeholder="Напиши решение здесь"' + EDIT_ATTRS +
      ' rows="' + rows(current) + '">' + esc(current) + '</textarea>';
    h += '<div class="run-actions">';
    h += '<button type="button" class="run-btn" data-act="run">▶ Запустить</button>';
    h += '<button type="button" class="ghost small" data-act="check">Сверить с решением</button>';
    h += '</div>';
    h += '<div class="run-out" role="status"' + (m.out ? '' : ' hidden') + '>' + (m.out || '') + '</div>';
    return h + '</div>';
  }

  function resultHtml(r) {
    var h = '';
    if (r.out) h += '<pre class="run-stdout">' + esc(r.out) + '</pre>';
    (r.images || []).forEach(function (img) {
      h += '<img class="run-img" alt="График, построенный примером" src="data:image/png;base64,' + img + '">';
    });
    if (r.error) {
      h += '<div class="run-error"><p><strong>' + esc(r.error.text) + '</strong></p>';
      if (r.error.hint) h += '<p>' + esc(r.error.hint) + ' <a class="link" href="#python/errors">Разбор ошибок</a></p>';
      h += '<div class="row"><button type="button" class="ghost small" data-act="reset-space">Начать заново</button>' +
        '<button type="button" class="ghost small" data-act="ask-error">Спросить Claude</button></div></div>';
    }
    if (!h) h = '<p class="run-status">Готово. Программа ничего не напечатала.</p>';
    return h;
  }

  function normalizeOut(text) {
    return text.split("\n").map(function (l) { return l.trim().replace(/\s+/g, " "); })
      .filter(function (l) { return l; }).join("\n");
  }

  function setOut(box, html) {
    var out = box.querySelector(".run-out");
    out.hidden = false;
    out.innerHTML = html;
    var id = box.dataset.id;
    runMem[id] = runMem[id] || {};
    runMem[id].out = html;
  }

  function currentCode(box) {
    var ta = box.querySelector(".code-edit");
    var id = box.dataset.id;
    if (box.classList.contains("user-box") || (runMem[id] && runMem[id].editing)) return ta.value;
    return runMem[id] && runMem[id].code != null ? runMem[id].code : originalCode(id);
  }

  async function runPrerequisites(id, status) {
    var pid = parseId(id).p.id;
    var done = ranIds[pid] = ranIds[pid] || {};
    var todo = prerequisites(id).filter(function (b) { return !done[b.id]; });
    for (var i = 0; i < todo.length; i++) {
      status("Выполняю предыдущие примеры урока: " + (i + 1) + " из " + todo.length + "…");
      var r = await window.Runner.run(todo[i].code, pid, status);
      if (r.error) {
        return { failed: todo[i], result: r };
      }
      done[todo[i].id] = true;
    }
    return null;
  }

  async function handleRun(box, check) {
    if (running) {
      setOut(box, '<p class="run-status">Подожди: ещё выполняется предыдущий запуск.</p>');
      return;
    }
    if (!window.Runner) {
      setOut(box, '<div class="run-error"><p>Модуль запуска не загрузился. Обнови страницу.</p></div>');
      return;
    }
    var id = box.dataset.id;
    var pid = parseId(id).p.id;
    var code = currentCode(box);
    if (!code.trim()) {
      setOut(box, '<p class="run-status">Сначала напиши код.</p>');
      return;
    }
    running = true;
    box.classList.add("busy");
    function status(text) {
      var out = box.querySelector(".run-out");
      out.hidden = false;
      out.innerHTML = '<p class="run-status">' + esc(text) + '</p>';
    }
    try {
      status(window.Runner.isReady() ? "Выполняю…" : "Загружаю Python…");
      await new Promise(function (r) { setTimeout(r, 30); });
      var failed = await runPrerequisites(id, status);
      if (failed) {
        setOut(box, '<div class="run-error"><p><strong>Не получилось выполнить предыдущий пример «' +
          esc(failed.failed.title) + '».</strong></p></div>' + resultHtml(failed.result));
        return;
      }
      status("Выполняю…");
      await new Promise(function (r) { setTimeout(r, 30); });
      var result = await window.Runner.run(code, pid, status);
      var part = parseId(id).part;
      if (part.charAt(0) === "s") (ranIds[pid] = ranIds[pid] || {})[id] = true;

      if (!check) {
        setOut(box, resultHtml(result));
        return;
      }
      if (result.error) {
        setOut(box, resultHtml(result));
        return;
      }
      var n = Number(part.slice(1));
      var reference = await window.Runner.run(parseId(id).t.practice[n].solution, pid, status);
      if (reference.error) {
        setOut(box, '<p class="run-status">Решение из урока не выполнилось, сверить не получилось.</p>' + resultHtml(result));
        return;
      }
      if (normalizeOut(result.out) === normalizeOut(reference.out)) {
        setOut(box, '<p class="run-ok">Совпадает с решением.</p>' + resultHtml(result));
      } else {
        setOut(box,
          '<p class="run-diff">Вывод отличается от решения. Это не всегда ошибка: иногда отличается только формат.</p>' +
          '<p class="code-label">Твой вывод</p>' + resultHtml(result) +
          '<p class="code-label">Вывод решения</p><pre class="run-stdout">' + esc(reference.out || "(пусто)") + '</pre>');
      }
    } catch (e) {
      setOut(box, '<div class="run-error"><p><strong>Не удалось загрузить Python.</strong></p>' +
        (navigator.onLine
          ? '<p>Проверь соединение и нажми «Запустить» ещё раз.</p>'
          : '<p>Сейчас нет интернета, а Python ещё не скачан для офлайна. Когда появится сеть, нажми на главной странице «Скачать Python для офлайна».</p>') +
        '</div>');
    } finally {
      running = false;
      box.classList.remove("busy");
    }
  }

  function handleEdit(box, act) {
    var id = box.dataset.id;
    var m = runMem[id] = runMem[id] || {};
    var pre = box.querySelector(".code-view");
    var ta = box.querySelector(".code-edit");
    var editBtn = box.querySelector('[data-act="edit"]');
    var restoreBtn = box.querySelector('[data-act="restore"]');
    if (act === "edit") {
      m.editing = true;
      if (m.code == null) m.code = originalCode(id);
      ta.value = m.code;
      ta.rows = rows(m.code);
      pre.hidden = true;
      ta.hidden = false;
      editBtn.hidden = true;
      restoreBtn.hidden = false;
      ta.focus();
    } else {
      m.editing = false;
      m.code = null;
      var original = originalCode(id);
      ta.value = original;
      pre.querySelector("code").textContent = original;
      pre.hidden = false;
      ta.hidden = true;
      editBtn.hidden = false;
      restoreBtn.hidden = true;
    }
  }

  async function handleResetSpace(box) {
    var pid = parseId(box.dataset.id).p.id;
    ranIds[pid] = {};
    if (window.Runner) await window.Runner.reset(pid);
    setOut(box, '<p class="run-status">Память очищена. Нажми «Запустить» ещё раз: примеры урока выполнятся по порядку.</p>');
  }

  app.addEventListener("input", function (e) {
    var ta = e.target;
    if (!ta.classList || !ta.classList.contains("code-edit")) return;
    var box = ta.closest(".runbox");
    ta.rows = rows(ta.value);
    if (!box) return;                      // поле кода в тренажёре сохраняется своим обработчиком
    var m = runMem[box.dataset.id] = runMem[box.dataset.id] || {};
    m.code = ta.value;
  });

  // Tab вставляет 4 пробела, Enter сохраняет отступ и добавляет 4 после двоеточия
  app.addEventListener("keydown", function (e) {
    var ta = e.target;
    if (!ta.classList || !ta.classList.contains("code-edit")) return;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      var before = ta.value.slice(0, ta.selectionStart);
      var line = before.slice(before.lastIndexOf("\n") + 1);
      var indent = line.match(/^ */)[0];
      if (/:\s*$/.test(line)) indent += "    ";
      if (!indent) return;
      e.preventDefault();
      ta.setRangeText("\n" + indent, ta.selectionStart, ta.selectionEnd, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // ---------- предскажи результат ----------

  var predictMem = {};

  function predictOn() { return state.settings.predict !== false; }

  function predictBlock(id, out) {
    var m = predictMem[id] || {};
    var h = '<div class="predict" data-id="' + esc(id) + '"><p class="code-label">Что напечатает программа?</p>';
    if (!m.revealed) {
      h += '<textarea class="predict-input" rows="2"' + EDIT_ATTRS +
        ' placeholder="Подумай и запиши свой прогноз. Можно пропустить." aria-label="Твой прогноз">' + esc(m.pred || '') + '</textarea>';
      h += '<button type="button" class="ghost small" data-act="reveal">Показать ответ</button>';
    } else {
      h += '<pre><code>' + esc(out) + '</code></pre>';
      if (m.pred && m.pred.trim()) {
        if (normalizeOut(m.pred) === normalizeOut(out)) {
          h += '<p class="run-ok">Точно угадал.</p>';
        } else {
          h += '<p class="run-diff">Сравни со своим прогнозом: что отличается и почему?</p>';
          h += '<pre class="run-stdout predict-mine">' + esc(m.pred) + '</pre>';
        }
      }
    }
    return h + '</div>';
  }

  function revealPrediction(box) {
    var id = box.dataset.id;
    var m = predictMem[id] = predictMem[id] || {};
    var ta = box.querySelector(".predict-input");
    if (ta) m.pred = ta.value;
    m.revealed = true;
    rerenderInPlace();
  }

  // ---------- живые графики ----------

  var widgetMem = {};

  function widgetHtml(id, name) {
    var def = window.Widgets.defs[name];
    var v = widgetMem[id] = widgetMem[id] || window.Widgets.defaults(name);
    var res = window.Widgets.draw(name, v);
    var h = '<div class="widget" data-id="' + esc(id) + '" data-widget="' + name + '">';
    h += '<p class="code-label">' + esc(def.title) + '</p>';
    h += '<div class="w-plot">' + res.svg + '</div>';
    def.controls.forEach(function (c) {
      h += '<label class="w-control"><span>' + esc(c.label) + ': <output>' + v[c.key] + '</output></span>' +
        '<input type="range" data-key="' + c.key + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step +
        '" value="' + v[c.key] + '"></label>';
    });
    h += '<p class="w-msg" aria-live="polite">' + esc(res.text) + '</p>';
    h += '<button type="button" class="ghost small" data-act="widget-reset">Вернуть как в уроке</button>';
    return h + '</div>';
  }

  function updateWidget(box) {
    var id = box.dataset.id, name = box.dataset.widget;
    var v = widgetMem[id];
    box.querySelectorAll('input[type="range"]').forEach(function (inp) {
      v[inp.dataset.key] = Number(inp.value);
      inp.closest(".w-control").querySelector("output").textContent = inp.value;
    });
    var res = window.Widgets.draw(name, v);
    box.querySelector(".w-plot").innerHTML = res.svg;
    box.querySelector(".w-msg").textContent = res.text;
  }

  app.addEventListener("input", function (e) {
    var el = e.target;
    if (el.type === "range" && el.closest(".widget")) updateWidget(el.closest(".widget"));
    if (el.classList && el.classList.contains("predict-input")) {
      var id = el.closest(".predict").dataset.id;
      (predictMem[id] = predictMem[id] || {}).pred = el.value;
    }
  });

  app.addEventListener("click", function (e) {
    var el = e.target.closest('[data-act="widget-reset"]');
    if (!el) return;
    var box = el.closest(".widget");
    widgetMem[box.dataset.id] = window.Widgets.defaults(box.dataset.widget);
    var v = widgetMem[box.dataset.id];
    box.querySelectorAll('input[type="range"]').forEach(function (inp) { inp.value = v[inp.dataset.key]; });
    updateWidget(box);
  });

  // ---------- повторение по расписанию ----------

  var INTERVALS = [1, 3, 7, 16];   // через сколько дней снова показать вопрос
  var reviewShown = null;          // { key, picked } — ответ, который сейчас на экране
  var reviewSession = { done: 0, right: 0 };

  function dayString(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function questionByKey(key) {
    var a = key.split(".");
    var p = project(a[0]);
    if (!p || !p.theory) return null;
    var t = p.theory.filter(function (x) { return x.id === a[1]; })[0];
    if (!t || !a[2]) return null;
    var qi = Number(a[2].slice(1));
    var q = t.quiz[qi];
    return q ? { p: p, t: t, q: q, qi: qi } : null;
  }

  function scheduleReview(key, box) {
    if (box >= INTERVALS.length) { delete state.review[key]; return; }
    state.review[key] = { box: box, due: dayString(INTERVALS[box]) };
  }

  function dueKeys() {
    var today = dayString(0);
    return Object.keys(state.review).filter(function (k) {
      return state.review[k].due <= today && (k.indexOf("term|") === 0 ? termByKey(k) : questionByKey(k));
    }).sort();
  }

  function reviewCard() {
    var due = dueKeys().length;
    var total = Object.keys(state.review).length;
    if (due) {
      return '<a class="next review-card" href="#review"><span class="next-label">Повторение</span>' +
        '<span class="next-text">' + due + ' ' + plural(due, "вопрос", "вопроса", "вопросов") + ' на сегодня</span>' +
        '<span class="next-meta">Вопросы, в которых ты ошибся. Пара минут — и они запомнятся надолго.</span></a>';
    }
    if (total) {
      var next = Object.keys(state.review).map(function (k) { return state.review[k].due; }).sort()[0];
      return '<p class="hint review-later">Повторение: ' + total + ' ' + plural(total, "вопрос", "вопроса", "вопросов") +
        ' в очереди, ближайшее ' + esc(next) + '.</p>';
    }
    return '';
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function answerReview(key, picked) {
    markActive();
    var qi = questionByKey(key);
    var item = state.review[key] || { box: 0 };
    var right = picked === qi.q.answer;
    scheduleReview(key, right ? item.box + 1 : 0);
    save();
    reviewSession.done++;
    if (right) reviewSession.right++;
    reviewShown = { key: key, picked: picked };
    render();
  }

  function viewReview() {
    var h = '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead"><p class="eyebrow">Повторение</p><h1>Вопросы на сегодня</h1>';
    h += '<p class="lead">Ответил верно — вопрос вернётся через ' + INTERVALS.slice(1).join(', ') +
      ' дней. Ошибся — завтра снова.</p></header>';

    var key = reviewShown ? reviewShown.key : dueKeys()[0];
    if (key && key.indexOf("term|") === 0) { app.innerHTML = h + termCardHtml(key); return; }
    if (!key) {
      h += '<section class="panel"><h2>На сегодня всё</h2>';
      if (reviewSession.done) {
        h += '<p>Повторено: ' + reviewSession.done + ', верно: ' + reviewSession.right + '.</p>';
      } else {
        h += '<p>Вопросов для повторения сейчас нет. Они появляются, когда ты ошибаешься в квизах уроков.</p>';
      }
      h += '<p><a class="link" href="#">Вернуться к пути</a></p></section>';
      app.innerHTML = h;
      return;
    }

    var qi = questionByKey(key);
    var left = dueKeys().filter(function (k) { return k !== key; }).length;
    h += '<section class="panel"><p class="hint">' + esc(qi.p.title) + ' · ' + esc(qi.t.title) +
      (left ? ' · ещё ' + left : '') + '</p>';
    h += '<fieldset class="q"><legend>' + fmt(qi.q.q) + '</legend>';
    order(qi.q.options.length, qi.qi * 31 + qi.q.q.length + qi.q.options[0].length).forEach(function (oi) {
      var cls = "opt", answered = !!reviewShown;
      if (answered && oi === qi.q.answer) cls += " right";
      else if (answered && oi === reviewShown.picked) cls += " wrong";
      h += '<button type="button" class="' + cls + '" data-act="review-answer" data-key="' + esc(key) + '" data-i="' + oi + '"' +
        (answered ? ' disabled' : '') + '>' + esc(qi.q.options[oi]) + '</button>';
    });
    if (reviewShown) {
      var right = reviewShown.picked === qi.q.answer;
      h += '<p class="why"><strong>' + (right ? 'Верно.' : 'Неверно.') + '</strong> ' + fmt(qi.q.why) + '</p>';
      var st = state.review[key];
      h += '<p class="hint">' + (st ? 'Снова покажу ' + esc(st.due) + '.' : 'Этот вопрос выучен и больше не повторяется.') + '</p>';
      h += '<button type="button" class="run-btn" data-act="review-next">Дальше</button>';
    }
    h += '</fieldset></section>';
    app.innerHTML = h;
  }

  // ---------- карточки терминов и словарь ----------

  function termKey(p, tid, i) { return "term|" + p.id + "|" + tid + "|" + i; }

  function termByKey(key) {
    var a = key.split("|");
    var p = project(a[1]);
    if (!p || !p.theory) return null;
    var t = p.theory.filter(function (x) { return x.id === a[2]; })[0];
    if (!t || !t.terms || !t.terms[Number(a[3])]) return null;
    return { p: p, t: t, term: t.terms[Number(a[3])] };
  }

  function addTerms(p, tid, offsetDays) {
    var t = p.theory.filter(function (x) { return x.id === tid; })[0];
    (t.terms || []).forEach(function (_, i) {
      var k = termKey(p, tid, i);
      if (!state.review[k]) state.review[k] = { box: 0, due: dayString(offsetDays) };
    });
    state.termsAdded[p.id + "." + tid] = true;
  }

  function termCardHtml(key) {
    var it = termByKey(key);
    var box = state.review[key] ? state.review[key].box : 0;
    var enFirst = box < 2;                  // сначала узнавать английский термин, потом вспоминать его
    var front = enFirst ? it.term[0] : it.term[1];
    var back = enFirst ? it.term[1] : it.term[0];
    var left = dueKeys().filter(function (k) { return k !== key; }).length;
    var h = '<section class="panel term-card"><p class="hint">Термин · ' + esc(it.t.title) + (left ? ' · ещё ' + left : '') + '</p>';
    h += '<p class="term-ask">' + (enFirst ? 'Что значит по-русски?' : 'Как это по-английски?') + '</p>';
    h += '<p class="term-front">' + esc(front) + (enFirst ? sayBtn(it.term[0]) : '') + '</p>';
    if (reviewShown && reviewShown.key === key && reviewShown.revealed) {
      h += '<p class="term-back">' + esc(back) + (enFirst ? '' : sayBtn(it.term[0])) + '</p>';
      h += '<div class="row"><button type="button" class="run-btn" data-act="term-grade" data-key="' + esc(key) + '" data-ok="1">Помню</button>';
      h += '<button type="button" class="ghost small" data-act="term-grade" data-key="' + esc(key) + '" data-ok="0">Не вспомнил</button></div>';
    } else {
      h += '<button type="button" class="run-btn" data-act="term-reveal" data-key="' + esc(key) + '">Показать ответ</button>';
    }
    return h + '</section>';
  }

  function gradeTerm(key, ok) {
    var item = state.review[key] || { box: 0 };
    markActive();
    scheduleReview(key, ok ? item.box + 1 : 0);
    save();
    reviewSession.done++;
    if (ok) reviewSession.right++;
    reviewShown = null;
    render();
    window.scrollTo(0, 0);
  }

  function allTerms() {
    var list = [];
    PATH.projects.forEach(function (p) {
      (p.theory || []).forEach(function (t) {
        (t.terms || []).forEach(function (x) { list.push({ en: x[0], ru: x[1], p: p, t: t }); });
      });
    });
    return list.sort(function (a, b) { return a.en.toLowerCase() < b.en.toLowerCase() ? -1 : 1; });
  }

  function viewGlossary() {
    var terms = allTerms();
    var h = '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead"><p class="eyebrow">Словарь</p><h1>Термины</h1>';
    h += '<p class="lead">' + terms.length + ' терминов из всех уроков. Так они звучат в документации, вакансиях и на собеседованиях.</p></header>';
    h += '<input type="search" id="glossary-q" class="glossary-search" placeholder="Поиск по-английски или по-русски" aria-label="Поиск термина">';
    h += '<dl class="terms glossary">';
    terms.forEach(function (x) {
      var hay = (x.en + " " + x.ru).toLowerCase();
      h += '<div class="g-row" data-text="' + esc(hay) + '"><dt>' + esc(x.en) + sayBtn(x.en) + '</dt><dd>' + esc(x.ru) +
        ' <a class="g-src" href="#' + x.p.id + '/theory/' + x.t.id + '">' + esc(x.t.title) + '</a></dd></div>';
    });
    h += '</dl><p class="hint" id="glossary-empty" hidden>Ничего не нашлось.</p>';
    app.innerHTML = h;
  }

  app.addEventListener("input", function (e) {
    if (e.target.id !== "glossary-q") return;
    var q = e.target.value.trim().toLowerCase();
    var shown = 0;
    app.querySelectorAll(".g-row").forEach(function (row) {
      var on = !q || row.dataset.text.indexOf(q) !== -1;
      row.hidden = !on;
      if (on) shown++;
    });
    document.getElementById("glossary-empty").hidden = shown > 0;
  });

  // ---------- неделя и серия дней ----------

  function markActive() { state.active[dayString(0)] = true; }

  function isActive(d) { return (state.log[d] || 0) > 0 || !!state.active[d]; }

  function streak() {
    var n = 0, off = isActive(dayString(0)) ? 0 : -1;
    while (isActive(dayString(off))) { n++; off--; }
    return n;
  }

  function weekDays() {
    var mondayOffset = (new Date().getDay() + 6) % 7;
    var days = [];
    for (var i = 0; i < 7; i++) days.push(dayString(i - mondayOffset));
    return days;
  }

  function hoursText(min) {
    var hrs = Math.round(min / 6) / 10;
    return String(hrs).replace(".", ",");
  }

  function logTime(min) {
    var today = dayString(0);
    state.log[today] = Math.max(0, (state.log[today] || 0) + min);
    if (min > 0) markActive();
    save();
    rerenderInPlace();
  }

  function weekCard() {
    var goal = state.settings.weekGoal || 12;
    var days = weekDays(), today = dayString(0);
    var mins = days.map(function (d) { return state.log[d] || 0; });
    var total = mins.reduce(function (a, b) { return a + b; }, 0);
    var max = Math.max(120, Math.max.apply(null, mins));
    var names = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    var pctDone = Math.min(100, Math.round(total / (goal * 60) * 100));
    var st = streak();

    var h = '<section class="week"><div class="quiz-head"><h2>Эта неделя</h2><span class="week-total">' +
      hoursText(total) + ' из ' + goal + ' ч</span></div>';
    h += bar(pctDone, 'Часы за неделю');
    h += '<div class="week-days">';
    days.forEach(function (d, i) {
      var hgt = Math.round(mins[i] / max * 48);
      h += '<div class="wd' + (d === today ? ' today' : '') + (isActive(d) ? ' on' : '') + '">' +
        '<span class="wd-bar" style="height:' + Math.max(hgt, isActive(d) ? 4 : 0) + 'px"></span>' +
        '<span class="wd-name">' + names[i] + '</span></div>';
    });
    h += '</div>';
    h += '<p class="hint">Сегодня: ' + (state.log[today] || 0) + ' мин' +
      (st ? ' · Серия: ' + st + ' ' + plural(st, "день", "дня", "дней") + ' подряд' : '') + '</p>';
    h += '<div class="row"><button type="button" class="ghost small" data-act="log-time" data-min="30">+30 мин</button>';
    h += '<button type="button" class="ghost small" data-act="log-time" data-min="60">+1 ч</button>';
    h += '<button type="button" class="ghost small" data-act="log-time" data-min="-30"' + ((state.log[today] || 0) ? '' : ' disabled') +
      ' aria-label="Убрать 30 минут">−30</button></div>';
    h += '<label class="week-goal">Цель в неделю: <select data-setting-num="weekGoal" aria-label="Цель часов в неделю">';
    for (var g = 5; g <= 20; g++) h += '<option value="' + g + '"' + (g === goal ? ' selected' : '') + '>' + g + ' ч</option>';
    h += '</select></label>';
    h += '<p class="hint">Отмечай время, когда занимаешься на компьютере. Дни, когда ты отвечал на вопросы или отмечал задачи, засчитываются в серию сами.</p>';
    return h + '</section>';
  }

  // ---------- диагностика ----------

  var diagShown = null;   // { q, picked }

  function diagScore() {
    var qs = window.DIAGNOSTIC ? window.DIAGNOSTIC.questions : [];
    var answers = state.diag.answers || {};
    var right = qs.filter(function (q, i) { return answers[i] === q.answer; }).length;
    return { right: right, total: qs.length };
  }

  function diagTopicStatus() {
    if (!state.diag.done || !window.DIAGNOSTIC) return null;
    var res = {};
    window.DIAGNOSTIC.questions.forEach(function (q, i) {
      var ok = state.diag.answers[i] === q.answer;
      res[q.topic] = res[q.topic] === undefined ? ok : res[q.topic] && ok;
    });
    return res;
  }

  function diagLessonNote(p, t) {
    var st = diagTopicStatus();
    if (!st) return null;
    var route = p.id + "/theory/" + t.id;
    var topics = window.DIAGNOSTIC.topics;
    var related = Object.keys(topics).filter(function (k) { return topics[k].lesson === route; });
    if (!related.length) return null;
    var weak = related.filter(function (k) { return !st[k]; });
    if (!weak.length) return { cls: "known", text: "По диагностике ты это знаешь: можно пролистать" };
    return { cls: "weak", text: "Подтянуть: " + weak.map(function (k) { return topics[k].title.toLowerCase(); }).join(", ") };
  }

  function diagInvite() {
    if (state.diag.done || !window.DIAGNOSTIC) return '';
    var started = state.diag.answers && Object.keys(state.diag.answers).length;
    return '<a class="next diag-card" href="#diagnostic"><span class="next-label">Сначала</span>' +
      '<span class="next-text">' + (started ? 'Закончить диагностику по Python' : 'Диагностика по Python, 10 минут') + '</span>' +
      '<span class="next-meta">Покажет, что ты уже знаешь и какие темы подтянуть.</span></a>';
  }

  function answerDiag(qi, picked) {
    state.diag.answers = state.diag.answers || {};
    state.diag.answers[qi] = picked;
    markActive();
    save();
    diagShown = { q: qi, picked: picked };
    render();
  }

  function diagNext() {
    diagShown = null;
    var total = window.DIAGNOSTIC.questions.length;
    if (Object.keys(state.diag.answers).length >= total) {
      state.diag.done = true;
      state.diag.date = dayString(0);
      save();
    }
    render();
    window.scrollTo(0, 0);
  }

  function viewDiagnostic() {
    var D = window.DIAGNOSTIC;
    var h = '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead"><p class="eyebrow">Диагностика</p><h1>База Python</h1></header>';

    if (!state.diag.answers) {
      h += '<section class="panel"><p>' + D.questions.length + ' коротких вопросов по основам Python: строки, списки, словари, циклы, функции и другое. ' +
        'Почти все — «что напечатает код».</p><p>Если не знаешь ответа, выбирай «Не знаю»: это честнее угадывания, и рекомендации будут точнее. ' +
        'Результат покажет, какие уроки можно пролистать, а какие темы подтянуть.</p>' +
        '<button type="button" class="run-btn" data-act="diag-start">Начать</button></section>';
      app.innerHTML = h;
      return;
    }

    if (!state.diag.done) {
      var qi = diagShown ? diagShown.q : D.questions.findIndex(function (_, i) { return state.diag.answers[i] === undefined; });
      if (qi === -1) { diagNext(); return; }
      var q = D.questions[qi];
      var dontKnow = q.options.length;
      h += '<section class="panel"><p class="hint">Вопрос ' + (qi + 1) + ' из ' + D.questions.length + ' · ' + esc(D.topics[q.topic].title) + '</p>';
      h += bar(Math.round(qi / D.questions.length * 100), 'Прогресс диагностики');
      h += '<fieldset class="q"><legend>' + esc(q.q) + '</legend>';
      if (q.code) h += '<pre><code>' + esc(q.code) + '</code></pre>';
      var opts = order(q.options.length, qi * 31 + q.q.length + q.options[0].length).concat([dontKnow]);
      opts.forEach(function (oi) {
        var cls = "opt", answered = !!diagShown;
        if (answered && oi === q.answer) cls += " right";
        else if (answered && oi === diagShown.picked) cls += " wrong";
        h += '<button type="button" class="' + cls + '" data-act="diag-answer" data-q="' + qi + '" data-i="' + oi + '"' +
          (answered ? ' disabled' : '') + '>' + esc(oi === dontKnow ? "Не знаю" : q.options[oi]) + '</button>';
      });
      if (diagShown) {
        var ok = diagShown.picked === q.answer;
        h += '<p class="why"><strong>' + (ok ? 'Верно.' : diagShown.picked === dontKnow ? 'Ответ:' : 'Неверно.') + '</strong> ' + esc(q.why) + '</p>';
        var last = Object.keys(state.diag.answers).length >= D.questions.length;
        h += '<button type="button" class="run-btn" data-act="diag-next">' + (last ? 'Результаты' : 'Дальше') + '</button>';
      }
      h += '</fieldset></section>';
      app.innerHTML = h;
      return;
    }

    var sc = diagScore(), st = diagTopicStatus();
    h += '<section class="panel"><h2>' + sc.right + ' из ' + sc.total + '</h2>';
    var weak = Object.keys(D.topics).filter(function (k) { return st[k] === false; });
    h += '<p>' + (weak.length ? 'Темы, которые стоит подтянуть, — сверху. С них начни первый проект.' :
      'Отлично: по базе Python пробелов не видно. Уроки про Python в проекте 1 можно читать бегло.') + '</p>';
    h += '<ul class="diag-topics">';
    Object.keys(D.topics).sort(function (a, b) { return (st[a] ? 1 : 0) - (st[b] ? 1 : 0); }).forEach(function (k) {
      if (st[k] === undefined) return;
      var tp = D.topics[k];
      h += '<li class="' + (st[k] ? 'known' : 'weak') + '"><span>' + (st[k] ? '✓' : '✕') + ' ' + esc(tp.title) + '</span>';
      if (!st[k]) {
        var links = [];
        var trainerTopic = pyTopicForDiag(k);
        if (trainerTopic) links.push('<a href="#python/' + trainerTopic.id + '">тренажёр</a>');
        if (tp.lesson) links.push('<a href="#' + tp.lesson + '">урок в приложении</a>');
        if (tp.doc) links.push('<a href="' + tp.doc + '" target="_blank" rel="noopener">учебник Python</a>');
        h += '<span class="diag-links">' + links.join(' · ') + '</span>';
      }
      h += '</li>';
    });
    h += '</ul>';
    h += '<p class="hint">Пройдено ' + esc(state.diag.date || '') + '. Отметки «можно пролистать» и «подтянуть» появились в списке уроков.</p>';
    h += '<button type="button" class="ghost small" data-act="diag-reset">Пройти заново</button></section>';
    app.innerHTML = h;
  }

  // ---------- спросить Claude ----------

  function openClaude(prompt) {
    var text = prompt.length > 3500 ? prompt.slice(0, 3500) + "…" : prompt;
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () { /* копирование не разрешено — не страшно */ });
    } catch (e) { /* не страшно */ }
    window.open("https://claude.ai/new?q=" + encodeURIComponent(text), "_blank", "noopener");
  }

  function currentLessonTitle() {
    var a = parts();
    var p = project(a[0]);
    var t = p && p.theory ? p.theory.filter(function (x) { return x.id === a[2]; })[0] : null;
    return { p: p, t: t };
  }

  function askHtml() {
    return '<section class="panel ask"><h2>Не понял? Спроси Claude</h2>' +
      '<textarea class="ask-input" rows="3"' + EDIT_ATTRS + ' placeholder="Что именно непонятно? Например: почему в формуле стоит плюс один?" aria-label="Твой вопрос"></textarea>' +
      '<button type="button" class="run-btn" data-act="ask-claude">Открыть Claude с вопросом</button>' +
      '<p class="hint">Тема урока подставится сама. Claude откроется с готовым текстом, проверь его и отправь. Текст также скопирован, его можно вставить вручную.</p></section>';
  }

  function askClaude(btn) {
    var c = currentLessonTitle();
    var q = btn.closest(".ask").querySelector(".ask-input").value.trim();
    var prompt = "Я учусь на ML-инженера по учебному приложению. Сейчас урок «" + c.t.title + "» (" +
      (isIntro(c.p) ? "вводный урок" : "проект «" + c.p.title + "»") + "). Объясни простыми словами, по-русски, " +
      "с маленьким примером на Python, если он нужен.\n\n" +
      (q ? "Мой вопрос: " + q : "Объясни главную идею этого урока ещё раз, другими словами, и дай одну небольшую задачу для проверки.");
    openClaude(prompt);
  }

  function askAboutError(box) {
    var r = parseId(box.dataset.id);
    var err = box.querySelector(".run-error strong");
    var code = currentCode(box);
    if (code.length > 1500) code = code.slice(0, 1500) + "\n…";
    openClaude("Я учусь Python по учебному приложению, урок «" + r.t.title + "». Запустил код и получил ошибку. " +
      "Объясни по-русски простыми словами, что она значит и как исправить.\n\nКод:\n" + code +
      "\n\nОшибка:\n" + (err ? err.textContent : ""));
  }

  // ---------- найди ошибку и собери код ----------

  var drillMem = {};

  function seededOrder(n, seedText) {
    var seed = 0;
    for (var i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    var a = [];
    for (var j = 0; j < n; j++) a.push(j);
    for (var k = n - 1; k > 0; k--) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      var r = seed % (k + 1);
      var tmp = a[k]; a[k] = a[r]; a[r] = tmp;
    }
    if (a.every(function (v, idx) { return v === idx; }) && n > 1) a.reverse();   // не показывать готовый порядок
    return a;
  }

  function drillsHtml(p, t) {
    var ex = window.EXERCISES && window.EXERCISES[p.id + "." + t.id];
    if (!ex) return '';
    var h = '<section class="panel drills"><h2>Тренировка</h2>';
    if (ex.bug) h += bugHtml(p.id + "." + t.id + "|bug", ex.bug);
    if (ex.order) h += orderHtml(p.id + "." + t.id + "|order", ex.order);
    return h + '</section>';
  }

  function solvedMark(key) { return state.drills[key] ? ' <span class="solved">✓ решено</span>' : ''; }

  function bugHtml(key, b) {
    var m = drillMem[key] || {};
    var done = m.picked === b.bugLine || m.shown;
    var h = '<div class="drill"><p><strong>Найди ошибку.</strong>' + solvedMark(key) + ' ' + esc(b.task) + '</p>';
    h += '<p class="hint">' + (b.actualError ? 'Код падает с ошибкой <code>' + esc(b.actual) + '</code>, а должен напечатать ' :
      'Код печатает <code>' + esc(b.actual) + '</code>, а должен ') + '<code>' + esc(b.expected) + '</code>. Нажми на строку с ошибкой.</p>';
    h += '<div class="code-lines">';
    b.lines.forEach(function (line, i) {
      if (!line.trim()) { h += '<div class="cl-gap"></div>'; return; }
      var cls = "cl";
      if (done && i === b.bugLine) cls += " right";
      else if (m.wrong && m.wrong.indexOf(i) !== -1) cls += " wrong";
      h += '<button type="button" class="' + cls + '" data-act="bug-pick" data-key="' + key + '" data-line="' + i + '"' +
        (done ? ' disabled' : '') + '>' + esc(line) + '</button>';
    });
    h += '</div>';
    if (done) {
      h += '<p class="why"><strong>' + (m.picked === b.bugLine ? 'Верно.' : 'Ответ.') + '</strong> ' + fmt(b.why) + '</p>';
      h += '<p class="code-label">Исправленная строка</p><pre><code>' + esc(b.fixedLine) + '</code></pre>';
    } else if (m.wrong && m.wrong.length) {
      h += '<p class="run-diff">Не эта строка. Попробуй ещё.</p>';
      h += '<button type="button" class="ghost small" data-act="bug-show" data-key="' + key + '">Показать ответ</button>';
    }
    return h + '</div>';
  }

  function pickBug(key, line) {
    var ex = drillSource(key);
    var m = drillMem[key] = drillMem[key] || {};
    if (line === ex.bugLine) {
      m.picked = line;
      state.drills[key] = true;
      if (isPyKey(key)) pyDone(pyIdOf(key), !(m.wrong && m.wrong.length));
      markActive();
      save();
    } else {
      m.wrong = (m.wrong || []).concat([line]);
    }
    rerenderInPlace();
  }

  function orderHtml(key, o) {
    var m = drillMem[key] || {};
    var placed = m.placed || [];
    var pool = seededOrder(o.lines.length, key).filter(function (i) { return placed.indexOf(i) === -1; });
    var h = '<div class="drill"><p><strong>Собери код.</strong>' + solvedMark(key) + ' ' + esc(o.task) + '</p>';
    h += '<p class="hint">Программа должна напечатать <code>' + esc(o.expected) + '</code>. Нажимай на строки по порядку, нажатие на строку в программе возвращает её обратно.</p>';
    h += '<p class="code-label">Твоя программа</p><div class="code-lines order-answer' + (m.result ? ' ' + m.result : '') + '">';
    if (!placed.length) h += '<p class="hint order-empty">Пока пусто</p>';
    placed.forEach(function (i) {
      h += '<button type="button" class="cl" data-act="order-remove" data-key="' + key + '" data-i="' + i + '"' +
        (m.result === 'right' ? ' disabled' : '') + '>' + esc(o.lines[i]) + '</button>';
    });
    h += '</div>';
    if (pool.length) {
      h += '<p class="code-label">Строки</p><div class="code-lines">';
      pool.forEach(function (i) {
        h += '<button type="button" class="cl" data-act="order-add" data-key="' + key + '" data-i="' + i + '">' + esc(o.lines[i]) + '</button>';
      });
      h += '</div>';
    }
    if (m.result === 'right') h += '<p class="run-ok">Верно: программа напечатает ' + esc(o.expected) + '.</p>';
    if (m.result === 'wrong') h += '<p class="run-diff">Пока не так. Подумай, что должно быть создано раньше, чем используется, и что входит внутрь цикла или функции.</p>';
    h += '<div class="row">';
    if (!pool.length && m.result !== 'right') h += '<button type="button" class="run-btn" data-act="order-check" data-key="' + key + '">Проверить</button>';
    if (placed.length) h += '<button type="button" class="ghost small" data-act="order-reset" data-key="' + key + '">Начать заново</button>';
    return h + '</div></div>';
  }

  function moveOrder(key, i, add) {
    var m = drillMem[key] = drillMem[key] || {};
    m.placed = m.placed || [];
    if (add) m.placed.push(i); else m.placed = m.placed.filter(function (x) { return x !== i; });
    m.result = null;
    rerenderInPlace();
  }

  function checkOrder(key) {
    var o = drillSource(key);
    var m = drillMem[key];
    var ok = o.valid.some(function (v) { return v.join(",") === m.placed.join(","); });
    m.result = ok ? 'right' : 'wrong';
    if (!ok) m.failed = true;
    if (ok) {
      state.drills[key] = true;
      if (isPyKey(key)) pyDone(pyIdOf(key), !m.failed);
      markActive(); save();
    }
    rerenderInPlace();
  }

  // ---------- контрольная по проекту ----------

  var EXAM_SIZE = 15, EXAM_PASS = 0.8;
  var examShown = null;   // { n, picked }

  function projectQuestionKeys(p) {
    var keys = [];
    p.theory.forEach(function (t) { t.quiz.forEach(function (_, qi) { keys.push(p.id + "." + t.id + ".q" + qi); }); });
    return keys;
  }

  function startExam(pid) {
    var p = project(pid);
    var prev = state.exams[pid] || {};
    var attempt = (prev.attempt || 0) + 1;
    var keys = projectQuestionKeys(p);
    var pick = seededOrder(keys.length, pid + "#" + attempt).slice(0, Math.min(EXAM_SIZE, keys.length));
    state.exams[pid] = { attempt: attempt, keys: pick.map(function (i) { return keys[i]; }), answers: {},
      passed: prev.passed, best: prev.best };
    examShown = null;
    save();
    rerenderInPlace();
  }

  function answerExam(pid, n, picked) {
    var ex = state.exams[pid];
    ex.answers[n] = picked;
    var qi = questionByKey(ex.keys[n]);
    if (picked !== qi.q.answer) scheduleReview(ex.keys[n], 0);
    markActive();
    save();
    examShown = { n: n, picked: picked };
    rerenderInPlace();
  }

  function examNext(pid) {
    var ex = state.exams[pid];
    examShown = null;
    if (Object.keys(ex.answers).length >= ex.keys.length && !ex.done) {
      var right = ex.keys.filter(function (k, n) { return ex.answers[n] === questionByKey(k).q.answer; }).length;
      ex.done = true;
      ex.score = right;
      ex.date = dayString(0);
      ex.best = Math.max(ex.best || 0, right / ex.keys.length);
      if (right / ex.keys.length >= EXAM_PASS) ex.passed = true;
      save();
    }
    render();
    window.scrollTo(0, 0);
  }

  function examHtml(p) {
    var ex = state.exams[p.id];
    var total = Math.min(EXAM_SIZE, projectQuestionKeys(p).length);
    var h = '<section class="panel">';
    if (!ex || !ex.keys) {
      h += '<h2>Контрольная по проекту</h2><p>' + total + ' вопросов из всех уроков проекта вперемешку. ' +
        'Сдана, если верно хотя бы ' + Math.round(EXAM_PASS * 100) + ' %. Вопросы с ошибками попадут в повторение.</p>' +
        '<p class="hint">Лучше проходить, когда прочитаны все уроки. Пересдавать можно сколько угодно: каждый раз будет другой набор.</p>' +
        '<button type="button" class="run-btn" data-act="exam-start" data-pid="' + p.id + '">Начать</button>';
      return h + '</section>';
    }
    if (!ex.done) {
      var n = examShown ? examShown.n : ex.keys.findIndex(function (_, i) { return ex.answers[i] === undefined; });
      var qi = questionByKey(ex.keys[n]);
      h += '<p class="hint">Вопрос ' + (n + 1) + ' из ' + ex.keys.length + ' · ' + esc(qi.t.title) + '</p>';
      h += bar(Math.round(n / ex.keys.length * 100), 'Прогресс контрольной');
      h += '<fieldset class="q"><legend>' + fmt(qi.q.q) + '</legend>';
      order(qi.q.options.length, qi.qi * 31 + qi.q.q.length + qi.q.options[0].length).forEach(function (oi) {
        var cls = "opt", answered = !!examShown;
        if (answered && oi === qi.q.answer) cls += " right";
        else if (answered && oi === examShown.picked) cls += " wrong";
        h += '<button type="button" class="' + cls + '" data-act="exam-answer" data-pid="' + p.id + '" data-n="' + n + '" data-i="' + oi + '"' +
          (answered ? ' disabled' : '') + '>' + esc(qi.q.options[oi]) + '</button>';
      });
      if (examShown) {
        h += '<p class="why"><strong>' + (examShown.picked === qi.q.answer ? 'Верно.' : 'Неверно.') + '</strong> ' + fmt(qi.q.why) + '</p>';
        var last = Object.keys(ex.answers).length >= ex.keys.length;
        h += '<button type="button" class="run-btn" data-act="exam-next" data-pid="' + p.id + '">' + (last ? 'Результат' : 'Дальше') + '</button>';
      }
      h += '</fieldset>';
      return h + '</section>';
    }
    var passedNow = ex.score / ex.keys.length >= EXAM_PASS;
    h += '<h2>' + ex.score + ' из ' + ex.keys.length + '</h2>';
    h += '<p class="' + (passedNow ? 'run-ok' : 'run-diff') + '">' + (passedNow ? 'Контрольная сдана.' :
      'Пока не сдана: нужно ' + Math.ceil(ex.keys.length * EXAM_PASS) + ' верных ответов.') + '</p>';
    var weakLessons = [];
    ex.keys.forEach(function (k, i) {
      var qi = questionByKey(k);
      if (ex.answers[i] !== qi.q.answer && weakLessons.indexOf(qi.t) === -1) weakLessons.push(qi.t);
    });
    if (weakLessons.length) {
      h += '<p>Стоит перечитать:</p><ul class="plain">' + weakLessons.map(function (t) {
        return '<li><a class="link" href="#' + p.id + '/theory/' + t.id + '">' + esc(t.title) + '</a></li>';
      }).join('') + '</ul><p class="hint">Вопросы с ошибками добавлены в повторение.</p>';
    }
    if (ex.passed && !passedNow) h += '<p class="hint">Раньше контрольная уже была сдана, эта отметка сохраняется.</p>';
    h += '<button type="button" class="ghost small" data-act="exam-start" data-pid="' + p.id + '">Пройти ещё раз</button>';
    return h + '</section>';
  }

  // ---------- проверка репозитория на GitHub ----------

  var REPO_EXTRA = {
    p1: [["notebook", "Есть ноутбук .ipynb или папка notebooks"]],
    p2: [["train.py", "Есть train.py"]],
    p3: [["dockerfile", "Есть Dockerfile"], [".github", "Есть папка .github с проверками CI"], ["tests", "Есть папка tests"]],
    p5: [["tests", "Есть папка tests"]],
    p6: [["decisions.md", "Есть DECISIONS.md"]]
  };

  function repoReportHtml(rep) {
    if (!rep) return '';
    if (rep.error) return '<p class="run-diff">' + esc(rep.error) + '</p>';
    var ok = rep.items.filter(function (i) { return i.ok; }).length;
    var h = '<p class="code-label">Проверено ' + esc(rep.date) + ': ' + ok + ' из ' + rep.items.length + '</p><ul class="repo-items">';
    rep.items.forEach(function (i) {
      h += '<li class="' + (i.ok ? 'ok' : 'no') + '"><span>' + (i.ok ? '✓' : '✕') + '</span> ' + esc(i.text) +
        (i.note ? ' <span class="hint">' + esc(i.note) + '</span>' : '') + '</li>';
    });
    return h + '</ul><p class="hint">Это автоматическая проверка формы. Качество кода и выводов она не оценивает.</p>';
  }

  function cyrillicShare(text) {
    var letters = (text.match(/[A-Za-zА-Яа-яЁё]/g) || []).length;
    return letters ? (text.match(/[А-Яа-яЁё]/g) || []).length / letters : 0;
  }

  async function checkRepo(p) {
    var report = document.getElementById("repo-report");
    var m = /github\.com\/([^\/\s?#]+)\/([^\/\s?#]+)/i.exec(state.repo[p.id] || "");
    function finish(rep) { state.repoCheck[p.id] = rep; save(); if (report) report.innerHTML = repoReportHtml(rep); }
    if (!m) { finish({ error: "Ссылка должна быть вида https://github.com/логин/репозиторий." }); return; }
    if (!navigator.onLine) { finish({ error: "Для проверки нужен интернет." }); return; }
    if (report) report.innerHTML = '<p class="run-status">Проверяю…</p>';
    var base = "https://api.github.com/repos/" + m[1] + "/" + m[2].replace(/\.git$/, "");
    async function get(path) {
      var r = await fetch(base + path, { headers: { Accept: "application/vnd.github+json" } });
      if (r.status === 404) return null;
      if (r.status === 403 || r.status === 429) throw new Error("limit");
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }
    try {
      var info = await get("");
      if (!info) { finish({ error: "Репозиторий не найден. Проверь ссылку и что репозиторий публичный." }); return; }
      var contents = (await get("/contents")) || [];
      var commits = (await get("/commits?per_page=100")) || [];
      var readme = await get("/readme");
      var names = contents.map(function (c) { return c.name.toLowerCase(); });
      var has = function (n) { return names.indexOf(n) !== -1; };
      var text = "";
      if (readme && readme.content) {
        var bin = atob(readme.content.replace(/\n/g, ""));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        text = new TextDecoder("utf-8").decode(bytes);
      }
      var msgs = commits.map(function (c) { return c.commit.message.split("\n")[0]; });
      var english = msgs.filter(function (msg) { return cyrillicShare(msg) === 0; }).length;
      var items = [
        { ok: !info.private, text: "Репозиторий публичный" },
        { ok: !!info.description, text: "Заполнено описание репозитория", note: info.description ? "" : "кнопка ⚙ справа от About" },
        { ok: text.length >= 1000, text: "README подробный", note: text ? text.length + " символов" : "README нет" },
        { ok: !!text && cyrillicShare(text) < 0.05, text: "README на английском" },
        { ok: /!\[[^\]]*\]\(|<img\s/i.test(text), text: "В README есть картинка, график или значок" },
        { ok: has("requirements.txt") || has("pyproject.toml"), text: "Есть requirements.txt" },
        { ok: has(".gitignore"), text: "Есть .gitignore" },
        { ok: commits.length >= 5, text: "Не меньше 5 коммитов", note: commits.length >= 100 ? "100+" : String(commits.length) },
        { ok: msgs.length > 0 && english / msgs.length >= 0.8, text: "Сообщения коммитов на английском",
          note: msgs.length ? english + " из " + msgs.length : "" }
      ];
      (REPO_EXTRA[p.id] || []).forEach(function (e) {
        var ok = e[0] === "notebook"
          ? names.some(function (n) { return /\.ipynb$/.test(n); }) || has("notebooks")
          : has(e[0]);
        items.push({ ok: ok, text: e[1] });
      });
      finish({ date: dayString(0), items: items });
    } catch (e) {
      finish({ error: e.message === "limit"
        ? "GitHub ограничивает число проверок без входа: около 60 запросов в час. Попробуй позже."
        : "Не получилось связаться с GitHub. Попробуй ещё раз." });
    }
  }

  // ---------- заметки ----------

  function noteHtml(p, t) {
    var key = p.id + "." + t.id;
    var n = state.notes[key];
    return '<section class="panel my-note"><h2>Мой конспект</h2>' +
      '<p class="hint">Перескажи урок своими словами: так он запоминается намного лучше. Сохраняется само.</p>' +
      '<textarea class="note-input" rows="5" data-note="' + key + '" placeholder="Главная мысль урока, пример, что было непонятно…" aria-label="Мой конспект">' +
      esc(n ? n.text : '') + '</textarea>' +
      '<p class="hint note-saved" aria-live="polite">' + (n && n.text.trim() ? 'Сохранено' : '') + '</p></section>';
  }

  var noteTimer = null;
  app.addEventListener("input", function (e) {
    var el = e.target;
    if (el.dataset.note !== undefined) {
      var key = el.dataset.note;
      if (el.value.trim()) state.notes[key] = { text: el.value, at: Date.now() };
      else state.notes[key] = { text: "", at: Date.now() };
    } else if (el.dataset.pyCode !== undefined) {
      pyState().code[el.dataset.pyCode] = { text: el.value, at: Date.now() };
    } else if (el.dataset.ivAnswer !== undefined) {
      var it = ivEntry(el.dataset.ivAnswer);
      it.answer = el.value;
      it.at = Date.now();
    } else return;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () {
      save();
      var mark = el.closest(".panel") && el.closest(".panel").querySelector(".note-saved");
      if (mark) mark.textContent = el.value.trim() ? "Сохранено" : "";
    }, 400);
  });

  function lessonOrder() {
    var list = [];
    PATH.projects.forEach(function (p) { (p.theory || []).forEach(function (t) { list.push({ p: p, t: t }); }); });
    return list;
  }

  function viewNotes() {
    var h = '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead"><p class="eyebrow">Заметки</p><h1>Мой конспект</h1>';
    var items = lessonOrder().filter(function (x) { var n = state.notes[x.p.id + "." + x.t.id]; return n && n.text.trim(); });
    var answers = window.INTERVIEW.filter(function (q) { var a = state.interview[q.id]; return a && a.answer && a.answer.trim(); });
    if (!items.length && !answers.length) {
      h += '<p class="lead">Пока пусто. Под каждым уроком есть поле «Мой конспект»: перескажи урок своими словами, и заметка появится здесь.</p></header>';
      app.innerHTML = h;
      return;
    }
    h += '<p class="lead">Заметки к ' + items.length + ' ' + plural(items.length, "уроку", "урокам", "урокам") +
      (answers.length ? ' и ответы на ' + answers.length + ' ' + plural(answers.length, "вопрос", "вопроса", "вопросов") + ' собеседования' : '') + '.</p></header>';
    h += '<button type="button" class="run-btn" data-act="notes-download">Скачать всё одним файлом (.md)</button>';
    h += '<p class="hint">Файл в формате Markdown: открывается в любом текстовом редакторе, VS Code и на GitHub.</p>';
    var lastP = null;
    items.forEach(function (x) {
      if (x.p !== lastP) { h += '<h2 class="notes-project">' + esc(x.p.title) + '</h2>'; lastP = x.p; }
      h += '<section class="panel"><h3><a class="link" href="#' + x.p.id + '/theory/' + x.t.id + '">' + esc(x.t.title) + '</a></h3>' +
        '<p class="note-text">' + esc(state.notes[x.p.id + "." + x.t.id].text) + '</p></section>';
    });
    if (answers.length) {
      h += '<h2 class="notes-project">Ответы для собеседования</h2>';
      answers.forEach(function (q) {
        h += '<section class="panel"><h3><a class="link" href="#interview/' + q.id + '">' + esc(q.q) + '</a></h3>' +
          '<p class="note-text">' + esc(state.interview[q.id].answer) + '</p></section>';
      });
    }
    app.innerHTML = h;
  }

  function notesMarkdown() {
    var md = "# ML Path — мой конспект\n\nВыгружено " + dayString(0) + "\n";
    var lastP = null;
    lessonOrder().forEach(function (x) {
      var n = state.notes[x.p.id + "." + x.t.id];
      if (!n || !n.text.trim()) return;
      if (x.p !== lastP) { md += "\n## " + x.p.title + "\n"; lastP = x.p; }
      md += "\n### " + x.t.title + "\n\n" + n.text.trim() + "\n";
    });
    var answers = window.INTERVIEW.filter(function (q) { var a = state.interview[q.id]; return a && a.answer && a.answer.trim(); });
    if (answers.length) {
      md += "\n## Ответы для собеседования\n";
      answers.forEach(function (q) { md += "\n### " + q.q + "\n\n" + state.interview[q.id].answer.trim() + "\n"; });
    }
    return md;
  }

  function downloadNotes() {
    var blob = new Blob([notesMarkdown()], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ml-path-notes-" + dayString(0) + ".md";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------- тренажёр собеседования ----------

  function ivEntry(id) { return (state.interview[id] = state.interview[id] || {}); }

  function ivDone(q) { var a = state.interview[q.id]; return !!(a && a.revealed); }

  function viewInterview(id) {
    var all = window.INTERVIEW;
    var q = all.filter(function (x) { return x.id === id; })[0];
    if (q) { viewInterviewQuestion(q); return; }
    var h = '<a class="back" href="#">← Весь путь</a>';
    var done = all.filter(ivDone).length;
    h += '<header class="phead"><p class="eyebrow">Тренажёр собеседования</p><h1>Расскажи о своих проектах</h1>';
    h += '<p class="lead">Вопросы, которые чаще всего задают о таких проектах. Ответь сначала сам — вслух и письменно, лучше по-английски. Потом сравни с тем, что должно быть в ответе.</p>';
    h += bar(Math.round(done / all.length * 100), 'Пройдено вопросов') + '<p class="hint">Пройдено ' + done + ' из ' + all.length + '</p></header>';
    h += '<button type="button" class="run-btn" data-act="iv-random" data-pid="">Случайный вопрос</button>';
    realProjects().forEach(function (p) {
      var qs = all.filter(function (x) { return x.pid === p.id; });
      h += '<section class="panel"><h2>' + esc(p.title) + '</h2><ul class="iv-list">';
      qs.forEach(function (x) {
        var a = state.interview[x.id];
        var mark = '';
        if (a && a.revealed) mark = '<span class="solved">' + (a.got ? a.got.length : 0) + ' из ' + x.points.length + '</span>';
        h += '<li><a href="#interview/' + x.id + '"><span lang="en">' + esc(x.q) + '</span>' + mark + '</a></li>';
      });
      h += '</ul></section>';
    });
    app.innerHTML = h;
  }

  function randomInterview() {
    var all = window.INTERVIEW;
    var fresh = all.filter(function (q) { return !ivDone(q); });
    var pool = fresh.length ? fresh : all;
    location.hash = "#interview/" + pool[Math.floor(Math.random() * pool.length)].id;
  }

  function viewInterviewQuestion(q) {
    var p = project(q.pid);
    var a = state.interview[q.id] || {};
    var lp = q.lesson.split(".");
    var lessonP = project(lp[0]);
    var lessonT = lessonP.theory.filter(function (t) { return t.id === lp[1]; })[0];
    var h = '<a class="back" href="#interview">← Все вопросы</a>';
    h += '<header class="phead"><p class="eyebrow">' + esc(p.title) + '</p><h1 lang="en" class="iv-q">' + esc(q.q) + sayBtn(q.q) + '</h1>';
    h += '<p class="lead">' + esc(q.ru) + '</p></header>';
    h += '<section class="panel"><h2>Твой ответ</h2>';
    h += '<p class="hint">Сначала скажи ответ вслух, как на собеседовании, потом запиши главное. Сохраняется само.</p>';
    h += '<textarea class="note-input" rows="6" data-iv-answer="' + q.id + '" lang="en" placeholder="In this project I…" aria-label="Твой ответ">' + esc(a.answer || '') + '</textarea>';
    if (speechRecognitionClass()) {
      h += '<button type="button" class="ghost small" data-act="iv-voice" data-id="' + q.id + '">🎤 Ответить голосом</button>';
      h += '<p class="hint" id="iv-voice-status" aria-live="polite">Говори по-английски: текст появится в поле. Обычно для распознавания нужен интернет.</p>';
    }
    if (!a.revealed) {
      h += '<button type="button" class="run-btn" data-act="iv-reveal" data-id="' + q.id + '">Что должно быть в ответе</button>';
    } else {
      h += '<h3>Что должно быть в ответе</h3><p class="hint">Отметь, что ты назвал.</p>';
      q.points.forEach(function (pt, i) {
        var on = a.got && a.got.indexOf(i) !== -1;
        h += '<label class="check"><input type="checkbox" data-iv-point="' + q.id + '" data-i="' + i + '"' + (on ? ' checked' : '') + '> <span>' + fmt(pt) + '</span></label>';
      });
      h += '<p class="hint">Подробнее в уроке <a class="link" href="#' + lessonP.id + '/theory/' + lessonT.id + '">' + esc(lessonT.title) + '</a>.</p>';
    }
    h += '<div class="row"><button type="button" class="ghost small" data-act="iv-claude" data-id="' + q.id + '">Попросить Claude оценить ответ</button></div>';
    h += '</section>';
    var all = window.INTERVIEW, i = all.indexOf(q);
    var next = all[i + 1];
    var prev = all[i - 1];
    h += '<nav class="pager">' + (prev ? '<a href="#interview/' + prev.id + '">← Предыдущий</a>' : '<span></span>') +
      '<a class="pager-next" href="#interview' + (next ? '/' + next.id : '') + '">' + (next ? 'Следующий вопрос →' : 'Ко всем вопросам →') + '</a></nav>';
    app.innerHTML = h;
  }

  app.addEventListener("change", function (e) {
    var el = e.target;
    if (el.dataset.ivPoint === undefined) return;
    var it = ivEntry(el.dataset.ivPoint);
    var i = Number(el.dataset.i);
    it.got = (it.got || []).filter(function (x) { return x !== i; });
    if (el.checked) it.got.push(i);
    it.at = Date.now();
    markActive();
    save();
  });

  function askClaudeInterview(id) {
    var q = window.INTERVIEW.filter(function (x) { return x.id === id; })[0];
    var a = state.interview[id] || {};
    var answer = (a.answer || "").trim();
    openClaude("Я готовлюсь к собеседованию на позицию junior ML engineer на международном рынке. " +
      "Вопрос интервьюера: \"" + q.q + "\"\n\n" +
      (answer ? "Мой ответ:\n" + answer + "\n\nОцени ответ как интервьюер: что хорошо, чего не хватает, что звучит неуверенно. " +
        "Исправь ошибки в английском и предложи улучшенную версию на английском, примерно на две минуты речи. Объяснения дай по-русски."
        : "Я ещё не ответил. Задай мне этот вопрос как интервьюер, дождись моего ответа на английском, потом оцени его и исправь английский. Объяснения по-русски."));
  }

  // ---------- синхронизация через приватный репозиторий GitHub ----------

  function syncCfg() { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } }
  function setSyncCfg(c) { try { localStorage.setItem(SYNC_KEY, JSON.stringify(c)); } catch (e) { /* нет хранилища */ } }

  function markDirty() {
    var cfg = syncCfg();
    if (!cfg.token) return;
    changeCount++;
    if (!cfg.dirty) { cfg.dirty = true; setSyncCfg(cfg); }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncNow(false); }, 15000);
  }

  function hasProgress(s) {
    return ["tasks", "criteria", "quiz", "review", "notes", "interview", "drills", "exams", "log"].some(function (k) {
      return s[k] && Object.keys(s[k]).length > 0;
    }) || !!(s.diag && s.diag.answers);
  }

  function b64encode(text) { return btoa(unescape(encodeURIComponent(text))); }
  function b64decode(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, "")))); }

  function SyncError(code) { this.code = code; }

  async function gh(cfg, method, path, body) {
    var r = await fetch("https://api.github.com/repos/" + cfg.repo + path, {
      method: method, cache: "no-store",
      headers: { Authorization: "Bearer " + cfg.token, Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (r.status === 401) throw new SyncError("token");
    if (r.status === 403 || r.status === 429) throw new SyncError("forbidden");
    return r;
  }

  async function pullRemote(cfg) {
    var r = await gh(cfg, "GET", "/contents/" + SYNC_FILE);
    if (r.status === 404) return null;
    if (!r.ok) throw new SyncError("http");
    var j = await r.json();
    var data = null;
    try { data = JSON.parse(b64decode(j.content || "")); } catch (e) { data = null; }
    return { sha: j.sha, state: data && data.state };
  }

  async function pushRemote(cfg, sha) {
    var r = await gh(cfg, "PUT", "/contents/" + SYNC_FILE, {
      message: "Sync progress " + new Date().toISOString().slice(0, 16).replace("T", " "),
      content: b64encode(JSON.stringify({ app: "ml-path", savedAt: new Date().toISOString(), state: state })),
      sha: sha || undefined
    });
    if (r.status === 409 || r.status === 422) return null;      // файл успел измениться на другом устройстве
    if (r.status === 404) throw new SyncError("norepo");
    if (!r.ok) throw new SyncError("http");
    return (await r.json()).content.sha;
  }

  function newer(a, b) { return (a && a.at || 0) >= (b && b.at || 0) ? a : b; }

  // Слияние, когда прогресс менялся на обоих устройствах: ничего сделанного не теряем
  function mergeStates(a, b) {
    a = Object.assign(emptyState(), a); b = Object.assign(emptyState(), b);
    var m = Object.assign(emptyState(), b, a);
    ["tasks", "criteria", "drills", "termsAdded", "active", "quiz", "repo", "repoCheck", "settings"].forEach(function (k) {
      m[k] = Object.assign({}, b[k], a[k]);
    });
    m.log = Object.assign({}, b.log);
    Object.keys(a.log).forEach(function (d) { m.log[d] = Math.max(a.log[d], b.log[d] || 0); });
    m.review = Object.assign({}, b.review);
    Object.keys(a.review).forEach(function (k) {
      var x = a.review[k], y = b.review[k];
      m.review[k] = !y || x.box > y.box || (x.box === y.box && x.due >= y.due) ? x : y;
    });
    var cnt = function (d) { return d && d.answers ? Object.keys(d.answers).length : 0; };
    m.diag = (a.diag.done && !b.diag.done) || (!!a.diag.done === !!b.diag.done && cnt(a.diag) >= cnt(b.diag)) ? a.diag : b.diag;
    m.exams = Object.assign({}, b.exams);
    Object.keys(a.exams).forEach(function (pid) {
      var x = a.exams[pid], y = b.exams[pid];
      if (!y) { m.exams[pid] = x; return; }
      var pick = Object.assign({}, (x.attempt || 0) >= (y.attempt || 0) ? x : y);
      pick.passed = !!(x.passed || y.passed);
      pick.best = Math.max(x.best || 0, y.best || 0);
      m.exams[pid] = pick;
    });
    m.read = Object.assign({}, b.read);
    Object.keys(a.read).forEach(function (k) {
      var u = (a.read[k] || []).concat(b.read[k] || []);
      m.read[k] = u.filter(function (x, i) { return u.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
    });
    m.pos = (a.pos && a.pos.at || 0) >= (b.pos && b.pos.at || 0) ? a.pos : b.pos;
    var pa = Object.assign({ done: {}, review: {}, code: {}, hints: {}, daily: {} }, a.py);
    var pb = Object.assign({ done: {}, review: {}, code: {}, hints: {}, daily: {} }, b.py);
    m.py = { done: Object.assign({}, pb.done, pa.done), review: Object.assign({}, pb.review), code: Object.assign({}, pb.code),
      hints: Object.assign({}, pb.hints, pa.hints), daily: (pa.daily.date || "") >= (pb.daily.date || "") ? pa.daily : pb.daily };
    Object.keys(pa.review).forEach(function (id) {
      var x = pa.review[id], y = pb.review[id];
      m.py.review[id] = !y || x.box > y.box || (x.box === y.box && x.due >= y.due) ? x : y;
    });
    Object.keys(pa.code).forEach(function (id) { m.py.code[id] = newer(pa.code[id], pb.code[id]); });
    ["notes", "interview"].forEach(function (k) {
      m[k] = Object.assign({}, b[k]);
      Object.keys(a[k]).forEach(function (id) { m[k][id] = newer(a[k][id], b[k][id]); });
    });
    return m;
  }

  function applyRemote(next) {
    applyingRemote = true;
    state = Object.assign(emptyState(), next);
    save();
    applyingRemote = false;
    var f = document.activeElement;
    if (f && /^(TEXTAREA|INPUT)$/.test(f.tagName) && app.contains(f)) return;   // не мешать набору текста
    rerenderInPlace();
  }

  async function syncNow(manual) {
    var cfg = syncCfg();
    if (!cfg.token || !cfg.repo || syncing) return;
    if (!navigator.onLine) { if (manual) { cfg.error = "Нет интернета. Синхронизация пройдёт, когда он появится."; setSyncCfg(cfg); syncStatus(); } return; }
    syncing = true;
    clearTimeout(syncTimer);
    syncStatus("Синхронизация…");
    try {
      for (var attempt = 0; attempt < 3; attempt++) {
        cfg = syncCfg();
        var remote = await pullRemote(cfg);
        lastPull = Date.now();
        cfg = syncCfg();
        if (remote && remote.sha !== cfg.sha && remote.state) {
          applyRemote(cfg.dirty ? mergeStates(state, remote.state) : remote.state);
        }
        if (cfg.dirty || !remote) {
          var pushedAt = changeCount;
          var sha = await pushRemote(cfg, remote && remote.sha);
          if (!sha) continue;
          cfg = syncCfg();
          cfg.sha = sha;
          cfg.dirty = changeCount !== pushedAt;
        } else {
          cfg.sha = remote.sha;
        }
        cfg.last = new Date().toISOString();
        cfg.error = "";
        setSyncCfg(cfg);
        break;
      }
    } catch (e) {
      cfg = syncCfg();
      cfg.error = ({
        token: "GitHub не принял токен. Возможно, у него истёк срок — создай новый.",
        forbidden: "У токена нет права записи в этот репозиторий. Проверь, что выбран нужный репозиторий и Contents: Read and write.",
        norepo: "Репозиторий не найден. Проверь название и что токен выдан именно на него."
      })[e.code] || "Не получилось связаться с GitHub. Попробую позже.";
      setSyncCfg(cfg);
    }
    syncing = false;
    syncStatus();
    if (syncCfg().dirty && !syncCfg().error) { clearTimeout(syncTimer); syncTimer = setTimeout(function () { syncNow(false); }, 15000); }
  }

  function syncStateText() {
    var cfg = syncCfg();
    if (cfg.error) return '<span class="run-diff">' + esc(cfg.error) + '</span>';
    if (!cfg.last) return 'Ещё не синхронизировано.';
    var d = new Date(cfg.last);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'Последняя синхронизация: ' + (d.toDateString() === new Date().toDateString() ? 'сегодня' : d.toLocaleDateString('ru-RU')) +
      ' в ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + (cfg.dirty ? '. Есть новые изменения, скоро отправлю.' : '.');
  }

  function syncStatus(text) {
    var el = document.getElementById("sync-status");
    if (el) el.innerHTML = text ? esc(text) : syncStateText();
  }

  function guessOwner() {
    var m = /^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
    return m ? m[1] : "";
  }

  function syncPanelHtml() {
    var cfg = syncCfg();
    var h = '<details class="sync"' + (cfg.token && cfg.error ? ' open' : '') + '><summary>' +
      (cfg.token ? 'Синхронизация включена' : 'Синхронизация телефона и компьютера') + '</summary>';
    if (cfg.token) {
      h += '<p>Прогресс, заметки и ответы сохраняются в приватном репозитории <strong>' + esc(cfg.repo) + '</strong> и сами подтягиваются на другом устройстве.</p>';
      h += '<p id="sync-status" class="hint" role="status">' + syncStateText() + '</p>';
      h += '<div class="row"><button type="button" data-act="sync-now">Синхронизировать сейчас</button>' +
        '<button type="button" data-act="sync-off">Отключить на этом устройстве</button></div>';
      return h + '</details>';
    }
    var owner = guessOwner();
    var tokenUrl = "https://github.com/settings/personal-access-tokens/new?name=" + encodeURIComponent("ml-path sync") +
      "&description=" + encodeURIComponent("Progress sync for the ml-path learning app") + "&expires_in=366&contents=write";
    h += '<p>Один раз на каждом устройстве, минут пять. Прогресс будет храниться в твоём приватном репозитории на GitHub.</p><ol class="sync-steps">';
    h += '<li>Создай <strong>приватный</strong> репозиторий <code>ml-path-progress</code>: <a class="link" target="_blank" rel="noopener" href="https://github.com/new?name=ml-path-progress&visibility=private&description=' +
      encodeURIComponent("Progress of the ml-path learning app") + '">открыть форму</a>. Нажми Create repository.</li>';
    h += '<li>Создай токен доступа: <a class="link" target="_blank" rel="noopener" href="' + tokenUrl + '">открыть форму</a>. ' +
      'Название и права уже заполнены. В разделе Repository access выбери <strong>Only select repositories</strong> и отметь <code>ml-path-progress</code>. ' +
      'Проверь, что в Permissions стоит Contents: Read and write. Нажми Generate token и скопируй его.</li>';
    h += '<li>Вставь сюда и нажми «Подключить».</li></ol>';
    h += '<label class="field">Репозиторий<input type="text" id="sync-repo"' + EDIT_ATTRS + ' value="' + esc(owner ? owner + '/ml-path-progress' : '') + '" placeholder="логин/ml-path-progress"></label>';
    h += '<label class="field">Токен<input type="password" id="sync-token"' + EDIT_ATTRS + ' placeholder="github_pat_…"></label>';
    h += '<button type="button" data-act="sync-connect">Подключить</button>';
    h += '<p id="sync-status" class="hint" role="status"></p>';
    h += '<p class="hint">Токен хранится только в браузере этого устройства и даёт доступ к одному репозиторию. ' +
      'На телефоне удобнее создать второй токен той же ссылкой, чем переписывать первый.</p>';
    return h + '</details>';
  }

  async function connectSync() {
    var repo = document.getElementById("sync-repo").value.trim()
      .replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/, "").replace(/\/+$/, "");
    var token = document.getElementById("sync-token").value.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { syncStatus("Репозиторий нужен в виде логин/название."); return; }
    if (!token) { syncStatus("Вставь токен."); return; }
    if (!navigator.onLine) { syncStatus("Для подключения нужен интернет."); return; }
    syncStatus("Проверяю…");
    var cfg = { repo: repo, token: token };
    try {
      var r = await gh(cfg, "GET", "");
      if (r.status === 404) { syncStatus("Репозиторий не найден. Проверь название и что токен выдан на этот репозиторий."); return; }
      if (!r.ok) throw new SyncError("http");
      var info = await r.json();
      if (!info.private) { syncStatus("Этот репозиторий публичный: прогресс и заметки увидят все. Сделай его приватным в Settings репозитория или создай новый приватный."); return; }
    } catch (e) {
      syncStatus(e.code === "token" ? "GitHub не принял токен. Скопируй его заново целиком." :
        e.code === "forbidden" ? "У токена нет доступа к этому репозиторию." : "Не получилось связаться с GitHub. Попробуй ещё раз.");
      return;
    }
    cfg.dirty = hasProgress(state);     // прогресс этого устройства сольётся с тем, что уже лежит в репозитории
    setSyncCfg(cfg);
    await syncNow(true);
    rerenderInPlace();
    var d = document.querySelector(".sync"); if (d) d.open = true;
  }

  function disconnectSync() {
    try { localStorage.removeItem(SYNC_KEY); } catch (e) { /* ничего */ }
    clearTimeout(syncTimer);
    rerenderInPlace();
  }

  // Подтягиваем изменения при открытии и при возвращении в приложение, отправляем при уходе
  document.addEventListener("visibilitychange", function () {
    if (!syncCfg().token) return;
    if (document.visibilityState === "hidden") { if (syncCfg().dirty) syncNow(false); }
    else if (Date.now() - lastPull > 15000) syncNow(false);
  });
  window.addEventListener("online", function () { if (syncCfg().token) syncNow(false); });

  // ---------- части урока, оглавление и место остановки ----------

  var lessonCtx = null;

  function lessonParts(t) {
    var nums = (String(t.time).match(/\d+/g) || ["30"]).map(Number);
    var lo = nums[0], hi = nums[nums.length - 1];
    var count = hi >= 90 ? 3 : hi >= 60 ? 2 : 1;
    count = Math.min(count, t.sections.length);
    var w = t.sections.map(function (s) {
      return 1 + (s.p || []).join(" ").split(/\s+/).length + (s.code ? s.code.split("\n").length * 6 : 0);
    });
    var total = w.reduce(function (a, b) { return a + b; }, 0), acc = 0, of = [];
    w.forEach(function (x, i) {
      var part = Math.min(count - 1, Math.floor(acc / total * count));
      // в каждой части хотя бы один раздел
      if (i > 0 && part > of[i - 1] + 1) part = of[i - 1] + 1;
      of.push(Math.max(part, count - (w.length - i)));
      acc += x;
    });
    var minutes = count > 1 ? (Math.round(lo / count) === Math.round(hi / count) ? '~' + Math.round(lo / count) :
      '~' + Math.round(lo / count) + '–' + Math.round(hi / count)) + ' мин' : '';
    return { count: count, of: of, minutes: minutes };
  }

  function readOf(p, t) { return state.read[p.id + "." + t.id] || []; }

  function tocHtml(p, t, parts) {
    var read = readOf(p, t);
    var here = state.pos && state.pos.pid === p.id && state.pos.tid === t.id ? state.pos.sec : -1;
    var h = '<details class="toc"><summary>Содержание · прочитано ' + read.length + ' из ' + t.sections.length +
      (parts.count > 1 ? ' · ' + parts.count + ' части по ' + parts.minutes : '') + '</summary><ol class="toc-list">';
    t.sections.forEach(function (s, si) {
      if (parts.count > 1 && (si === 0 || parts.of[si] !== parts.of[si - 1])) {
        h += '<li class="toc-part">Часть ' + (parts.of[si] + 1) + '</li>';
      }
      var cls = 'toc-item' + (read.indexOf(si) !== -1 ? ' read' : '') + (si === here ? ' here' : '');
      h += '<li><button type="button" class="' + cls + '" data-act="goto-sec" data-i="' + si + '">' +
        '<span class="toc-mark" aria-hidden="true"></span>' + esc(s.h) + '</button></li>';
    });
    if (t.practice) h += '<li><button type="button" class="toc-item" data-act="goto-sec" data-i="practice"><span class="toc-mark" aria-hidden="true"></span>Практика и итог урока</button></li>';
    return h + '</ol></details>';
  }

  function resumeHtml(p, t) {
    var pos = state.pos;
    if (!pos || pos.pid !== p.id || pos.tid !== t.id || !(pos.sec > 0) || !t.sections[pos.sec]) return '';
    if (/^s\d+$/.test(parts()[3] || "")) return '';
    if (readOf(p, t).length >= t.sections.length) return '';
    return '<div class="resume"><p>Ты остановился на разделе «' + esc(t.sections[pos.sec].h) + '».</p>' +
      '<button type="button" class="run-btn" data-act="goto-sec" data-i="' + pos.sec + '">Продолжить</button></div>';
  }

  function gotoSection(i) {
    var el = document.getElementById(i === "practice" ? "practice" : "sec-" + i);
    if (!el) return;
    var d = app.querySelector(".toc");
    if (d) d.open = false;
    el.scrollIntoView({ block: "start" });
  }

  function continueCard() {
    var pos = state.pos;
    if (!pos || !pos.pid) return '';
    var p = project(pos.pid);
    var t = p && p.theory ? p.theory.filter(function (x) { return x.id === pos.tid; })[0] : null;
    if (!t || !t.sections[pos.sec] || readOf(p, t).length >= t.sections.length) return '';
    return '<a class="next continue-card" href="#' + p.id + '/theory/' + t.id + '/s' + pos.sec + '">' +
      '<span class="next-label">Продолжить с места</span><span class="next-text">' + esc(t.title) + '</span>' +
      '<span class="next-meta">Раздел ' + (pos.sec + 1) + ' из ' + t.sections.length + ' · ' + esc(t.sections[pos.sec].h) + '</span></a>';
  }

  // Какой раздел сейчас читается: последний, чей заголовок поднялся выше трети экрана
  var trackTimer = null, saveTimer = null;
  window.addEventListener("scroll", function () {
    if (!lessonCtx || trackTimer) return;
    trackTimer = setTimeout(function () { trackTimer = null; trackReading(); }, 250);
  }, { passive: true });

  function trackReading() {
    if (!lessonCtx) return;
    var p = lessonCtx.p, t = lessonCtx.t, line = window.innerHeight * 0.35, cur = -1;
    app.querySelectorAll("[data-sec]").forEach(function (el) {
      if (el.getBoundingClientRect().top < line) cur = Number(el.dataset.sec);
    });
    var practice = document.getElementById("practice") || document.getElementById("quiz");
    var done = practice && practice.getBoundingClientRect().top < line;
    var n = t.sections.length;
    var mark = done ? n : cur;
    if (mark === lessonCtx.cur || cur < 0) return;
    lessonCtx.cur = mark;
    var key = p.id + "." + t.id, read = state.read[key] || [];
    for (var i = 0; i < Math.min(mark, n); i++) if (read.indexOf(i) === -1) read.push(i);
    state.read[key] = read.sort(function (x, y) { return x - y; });
    state.pos = { pid: p.id, tid: t.id, sec: Math.min(cur, n - 1), at: Date.now() };
    app.querySelectorAll(".toc-item[data-i]").forEach(function (b) {
      var i = Number(b.dataset.i);
      b.classList.toggle("read", read.indexOf(i) !== -1);
      b.classList.toggle("here", i === state.pos.sec);
    });
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 800);
  }

  // ---------- английский: пересказ, произношение, голосовой ответ ----------

  function canSpeak() { return typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined"; }

  function sayBtn(text, label) {
    if (!canSpeak()) return '';
    return '<button type="button" class="say' + (label ? ' say-wide' : '') + '" data-act="say" data-text="' + esc(text) +
      '" aria-label="Послушать по-английски">🔊' + (label ? ' ' + esc(label) : '') + '</button>';
  }

  function say(text) {
    if (!canSpeak()) return;
    var synth = window.speechSynthesis;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    var voices = synth.getVoices ? synth.getVoices() : [];
    var v = voices.filter(function (x) { return /^en(-|_)US/i.test(x.lang); })[0] || voices.filter(function (x) { return /^en/i.test(x.lang); })[0];
    if (v) u.voice = v;
    synth.speak(u);
  }

  function englishHtml(p, t) {
    var text = window.ENGLISH && window.ENGLISH[p.id + "." + t.id];
    if (!text) return '';
    return '<section class="panel english"><h2>Главное по-английски</h2><p lang="en">' + esc(text) + '</p>' +
      sayBtn(text, 'Послушать') +
      '<p class="hint">Прочитай вслух. Так ты повторяешь урок и тренируешь рассказ о проекте на английском. Незнакомые слова ищи в словарике ниже.</p></section>';
  }

  function speechRecognitionClass() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }

  var recog = null;

  function toggleVoice(id, btn) {
    var status = document.getElementById("iv-voice-status");
    if (recog) { recog.stop(); return; }
    var SR = speechRecognitionClass();
    var box = document.querySelector('textarea[data-iv-answer="' + id + '"]');
    if (!SR || !box) return;
    var base = box.value.trim() ? box.value.trim() + " " : "";
    recog = new SR();
    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = function (e) {
      var finalText = "", interim = "";
      for (var i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      box.value = base + finalText + interim;
      box.dispatchEvent(new Event("input", { bubbles: true }));
    };
    recog.onerror = function (e) {
      if (status) status.textContent = e.error === "not-allowed" || e.error === "service-not-allowed"
        ? "Нет доступа к микрофону. Разреши его в настройках браузера для этого сайта."
        : e.error === "network" ? "Не получилось распознать: нужен интернет." : "Не получилось распознать речь. Попробуй ещё раз.";
    };
    recog.onend = function () {
      recog = null;
      btn.textContent = "🎤 Ответить голосом";
      if (status && /Слушаю/.test(status.textContent)) status.textContent = "Готово. Проверь текст и поправь, если что-то распозналось неточно.";
    };
    try {
      recog.start();
      btn.textContent = "⏹ Остановить";
      if (status) status.textContent = "Слушаю. Говори по-английски, потом нажми «Остановить».";
    } catch (err) {
      recog = null;
      if (status) status.textContent = "Не получилось включить микрофон.";
    }
  }

  // ---------- тренажёр Python ----------

  var STEP_NAMES = { predict: "Прочитай код", bug: "Найди ошибку", order: "Собери код", fill: "Допиши", write: "Напиши сам" };
  var STEP_ORDER = ["predict", "bug", "order", "fill", "write"];
  var pyMem = {};

  function PT() { return window.PYTRAINER || { topics: [], errors: { items: [] } }; }
  function pyState() {
    state.py = state.py || {};
    ["done", "review", "code", "hints", "daily"].forEach(function (k) { state.py[k] = state.py[k] || {}; });
    return state.py;
  }
  function isPyKey(key) { return key.indexOf("py:") === 0; }
  function pyIdOf(key) { return key.split("|")[0].slice(3); }
  function pyTask(id) {
    var tp = PT().topics.filter(function (x) { return id.indexOf(x.id + ".") === 0; })[0];
    return tp ? tp.tasks.filter(function (t) { return t.id === id; })[0] : null;
  }
  function pyTopic(id) { return PT().topics.filter(function (x) { return x.id === id; })[0]; }
  function pyTopicOfTask(id) { return pyTopic(id.split(".")[0]); }
  function drillSource(key) {
    var base = key.split("|")[0];
    return isPyKey(key) ? pyTask(base.slice(3)) : window.EXERCISES[base][key.split("|")[1]];
  }
  function pyTopicForDiag(diagKey) {
    return PT().topics.filter(function (tp) { return tp.diag.indexOf(diagKey) !== -1; })[0] || null;
  }
  function pyWeak(tp) {
    var st = diagTopicStatus();
    return !!st && tp.diag.some(function (k) { return st[k] === false; });
  }
  function pyTopicDone(tp) { var s = pyState(); return tp.tasks.filter(function (t) { return s.done[t.id]; }).length; }

  function pyDone(id, clean) {
    var s = pyState(), today = dayString(0), r = s.review[id];
    var first = !s.done[id];
    s.done[id] = true;
    if (!clean) s.review[id] = { box: 0, due: dayString(1) };
    else if (r && r.due <= today) {
      var box = r.box + 1;
      if (box >= INTERVALS.length) delete s.review[id];
      else s.review[id] = { box: box, due: dayString(INTERVALS[box]) };
    }
    var d = s.daily;
    if (d.date === today && d.ids && d.ids[d.idx] === id && !(id in (d.results = d.results || {}))) d.results[id] = clean;
    markActive();
    save();
    return first;
  }

  // Порядок тем: сначала слабые по диагностике, потом остальные
  function pyTrack(tp) { return tp.track === "data" ? "data" : "py"; }
  function pyShare(track) {
    var s = pyState(), all = 0, done = 0;
    PT().topics.forEach(function (tp) {
      if (pyTrack(tp) !== track) return;
      tp.tasks.forEach(function (t) { all++; if (s.done[t.id]) done++; });
    });
    return all ? done / all : 0;
  }
  // NumPy и pandas попадают в разминку, когда решено 70% задач Python или ты сам начал эти темы
  function dataOpen() {
    var s = pyState();
    return pyShare("py") >= 0.7 || PT().topics.some(function (tp) {
      return pyTrack(tp) === "data" && tp.tasks.some(function (t) { return s.done[t.id]; });
    });
  }

  function pyTopicsOrdered() {
    var all = PT().topics.slice();
    return all.filter(pyWeak).concat(all.filter(function (tp) { return !pyWeak(tp); }));
  }

  function pyDaily() {
    var s = pyState(), today = dayString(0);
    if (s.daily.date !== today) {
      var ids = Object.keys(s.review).filter(function (id) { return s.review[id].due <= today && pyTask(id); })
        .sort(function (x, y) { return s.review[x].due < s.review[y].due ? -1 : 1; }).slice(0, 3);
      // Новые задачи: Python, а когда открыты NumPy и pandas — две из пяти оттуда
      var open = dataOpen();
      function take(track, limit) {
        pyTopicsOrdered().forEach(function (tp) {
          if (pyTrack(tp) !== track) return;
          tp.tasks.forEach(function (t) { if (ids.length < limit && !s.done[t.id] && ids.indexOf(t.id) === -1) ids.push(t.id); });
        });
      }
      if (open) take("data", Math.min(5, ids.length + 2));
      take("py", 5);
      if (open) take("data", 5);
      if (ids.length < 5) {
        Object.keys(s.done).forEach(function (id) { if (ids.length < 5 && ids.indexOf(id) === -1 && pyTask(id)) ids.push(id); });
      }
      s.daily = { date: today, ids: ids, idx: 0, results: {} };
      save();
    }
    return s.daily;
  }

  function pyHomeCard() {
    if (!PT().topics.length) return '';
    var d = pyState().daily;
    var today = dayString(0);
    var count = d.date === today ? Object.keys(d.results || {}).length : 0;
    if (d.date === today && d.idx >= d.ids.length) return '';
    return '<a class="next py-card" href="#python/daily"><span class="next-label">Разминка Python</span>' +
      '<span class="next-text">5 задач на 10–15 минут</span><span class="next-meta">' +
      (count ? 'Сделано ' + count + ' из 5' : 'Новые задачи и те, где были ошибки') + '</span></a>';
  }

  function viewPython(a1, a2) {
    if (a1 === "errors") { viewPyErrors(); return; }
    if (a1 === "daily") { viewPyDaily(); return; }
    var tp = pyTopic(a1);
    if (tp && a2) {
      var t = tp.tasks[Number(a2) - 1];
      if (t) { app.innerHTML = '<a class="back" href="#python/' + tp.id + '">← ' + esc(tp.title) + '</a>' + pyTaskHtml(t, null); return; }
    }
    if (tp) { viewPyTopic(tp); return; }
    var s = pyState(), today = dayString(0), d = s.daily;
    var h = '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead"><p class="eyebrow">Тренажёр</p><h1>Python каждый день</h1>';
    h += '<p class="lead">Короткие задачи с проверкой. В каждой теме лесенка: сначала читаешь код, потом находишь ошибку, собираешь, дописываешь и пишешь сам.</p></header>';
    var dailyDone = d.date === today && d.idx >= (d.ids || []).length;
    h += '<a class="next" href="#python/daily"><span class="next-label">Разминка на сегодня</span><span class="next-text">' +
      (dailyDone ? 'Сделана ✓ Можно ещё раз пройти любую тему' : '5 задач, 10–15 минут') + '</span><span class="next-meta">' +
      'Задачи с ошибками возвращаются через 1, 3, 7 и 16 дней</span></a>';
    var st = diagTopicStatus();
    var weak = PT().topics.filter(pyWeak);
    if (!st) h += '<p class="hint">Пройди <a class="link" href="#diagnostic">диагностику</a> — 10 минут, и тренажёр начнёт с твоих слабых тем.</p>';
    else if (weak.length) h += '<p>По диагностике начни с тем: ' + weak.map(function (tp) {
      return '<a class="link" href="#python/' + tp.id + '">' + esc(tp.title.toLowerCase()) + '</a>'; }).join(', ') + '.</p>';
    var due = Object.keys(s.review).filter(function (id) { return s.review[id].due <= today; }).length;
    if (due) h += '<p class="hint">Пора повторить задач: ' + due + '. Они попадут в разминку.</p>';
    function topicList(track) {
      var out = '<ul class="py-topics">';
      pyTopicsOrdered().forEach(function (tp) {
        if (pyTrack(tp) !== track) return;
        var n = pyTopicDone(tp);
        out += '<li><a href="#python/' + tp.id + '"><span class="py-topic-title">' + esc(tp.title) +
          (pyWeak(tp) ? ' <span class="py-weak">подтянуть</span>' : '') + '</span>' +
          '<span class="py-topic-meta">' + n + ' из ' + tp.tasks.length + '</span></a>' +
          bar(Math.round(n / tp.tasks.length * 100), 'Решено задач в теме') + '</li>';
      });
      return out + '</ul>';
    }
    h += '<section class="panel"><h2>Python</h2>' + topicList("py") + '</section>';
    if (PT().topics.some(function (tp) { return pyTrack(tp) === "data"; })) {
      var share = Math.round(pyShare("py") * 100);
      h += '<section class="panel" id="py-data"><h2>NumPy и pandas</h2>';
      h += '<p class="hint">На этом стоят проекты 1–2: таблицы стихов, подсчёты, метрики. ' +
        (dataOpen() ? 'Эти задачи уже попадают в разминку.' : 'Лучше браться, когда решено около 70% задач Python, сейчас ' + share + '%. ' +
          'Тогда они сами начнут попадать в разминку; начать можно и раньше.') +
        ' Первый запуск загружает pandas в браузер, это 10–20 секунд.</p>';
      h += topicList("data") + '</section>';
    }
    h += '<a class="next continue-card" href="#python/errors"><span class="next-label">Справочник</span><span class="next-text">Разбор типичных ошибок Python</span>' +
      '<span class="next-meta">Как читать сообщение об ошибке и что делать с каждой</span></a>';
    app.innerHTML = h;
  }

  function viewPyTopic(tp) {
    var s = pyState();
    var h = '<a class="back" href="#python">← Тренажёр</a>';
    h += '<header class="phead"><p class="eyebrow">Тема' + (pyWeak(tp) ? ' · по диагностике стоит подтянуть' : '') + '</p><h1>' + esc(tp.title) + '</h1>';
    h += '<p class="lead">' + fmt(tp.intro) + '</p>';
    if (pyTrack(tp) === "data") h += '<p class="hint">Код запускается в браузере с NumPy и pandas. Первый запуск дольше обычного: библиотеки загружаются один раз.</p>';
    var n = pyTopicDone(tp);
    h += bar(Math.round(n / tp.tasks.length * 100), 'Решено задач') + '<p class="hint">Решено ' + n + ' из ' + tp.tasks.length + '</p></header>';
    STEP_ORDER.forEach(function (kind, k) {
      h += '<section class="panel"><h2>' + (k + 1) + '. ' + STEP_NAMES[kind] + '</h2><ul class="py-tasks">';
      tp.tasks.forEach(function (t, i) {
        if (t.type !== kind) return;
        var label = t.task || 'Что напечатает код?';
        h += '<li><a href="#python/' + tp.id + '/' + (i + 1) + '"><span class="py-mark' + (s.done[t.id] ? ' done' : '') + '" aria-hidden="true"></span>' +
          '<span>' + fmt(label) + '</span></a></li>';
      });
      h += '</ul></section>';
    });
    var next = tp.tasks.map(function (t, i) { return i; }).filter(function (i) { return !s.done[tp.tasks[i].id]; })[0];
    if (next !== undefined) h += '<a class="next" href="#python/' + tp.id + '/' + (next + 1) + '"><span class="next-label">' +
      (n ? 'Продолжить' : 'Начать') + '</span><span class="next-text">' + STEP_NAMES[tp.tasks[next].type] + '</span></a>';
    app.innerHTML = h;
  }

  function viewPyDaily() {
    var d = pyDaily();
    var h = '<a class="back" href="#python">← Тренажёр</a>';
    if (d.idx >= d.ids.length) {
      var res = d.results || {}, ids = Object.keys(res);
      var clean = ids.filter(function (id) { return res[id]; }).length;
      h += '<header class="phead"><p class="eyebrow">Разминка</p><h1>Готово на сегодня</h1>';
      h += '<p class="lead">Без ошибок: ' + clean + ' из ' + ids.length + '.' +
        (clean < ids.length ? ' Задачи с ошибками вернутся завтра.' : ' Отличный день.') + '</p></header>';
      h += '<a class="next" href="#python"><span class="next-label">Дальше</span><span class="next-text">Темы тренажёра</span></a>';
      app.innerHTML = h;
      return;
    }
    var t = pyTask(d.ids[d.idx]);
    var s = pyState();
    var again = s.review[t.id] ? ' · повторение' : '';
    h += '<p class="eyebrow py-daily-head">Разминка · задача ' + (d.idx + 1) + ' из ' + d.ids.length + again + '</p>';
    h += bar(Math.round(d.idx / d.ids.length * 100), 'Прогресс разминки');
    h += pyTaskHtml(t, { daily: true });
    app.innerHTML = h;
  }

  function pyFinished(t) {
    var m = pyMem[t.id] || {};
    if (t.type === "bug") { var dm = drillMem["py:" + t.id + "|bug"] || {}; return dm.picked === t.bugLine || dm.shown; }
    if (t.type === "order") { return (drillMem["py:" + t.id + "|order"] || {}).result === "right"; }
    return !!(m.solved || m.shown);
  }

  function pyTaskHtml(t, ctx) {
    var tp = pyTopicOfTask(t.id);
    var idx = tp.tasks.indexOf(t);
    var h = '<header class="phead"><p class="eyebrow">' + esc(tp.title) + ' · ' + STEP_NAMES[t.type] +
      (pyState().done[t.id] ? ' · решено ✓' : '') + '</p>';
    h += '<h1 class="py-task-title">' + (t.type === "bug" || t.type === "order" ? STEP_NAMES[t.type] : fmt(t.task || 'Что напечатает этот код?')) + '</h1></header>';
    h += '<section class="panel">';
    if (t.type === "predict") h += predictHtml(t);
    else if (t.type === "bug") h += bugHtml("py:" + t.id + "|bug", t);
    else if (t.type === "order") h += orderHtml("py:" + t.id + "|order", t);
    else if (t.type === "fill") h += fillHtml(t);
    else h += writeHtml(t);
    h += '</section>';
    var done = pyFinished(t);
    if (ctx && ctx.daily) {
      if (done) h += '<button type="button" class="run-btn py-next" data-act="py-daily-next">Дальше</button>';
    } else {
      h += '<nav class="pager">' + (idx > 0 ? '<a href="#python/' + tp.id + '/' + idx + '">← Предыдущая</a>' : '<a href="#python/' + tp.id + '">← К теме</a>') +
        (idx < tp.tasks.length - 1 ? '<a class="pager-next" href="#python/' + tp.id + '/' + (idx + 2) + '">Следующая →</a>'
          : '<a class="pager-next" href="#python/' + tp.id + '">К теме →</a>') + '</nav>';
    }
    return h;
  }

  function codeBlock(text) { return '<pre class="py-code"><code>' + esc(text) + '</code></pre>'; }

  function predictHtml(t) {
    var m = pyMem[t.id] || {};
    var h = codeBlock(t.code);
    var finished = m.solved || m.shown;
    h += '<label class="field">Что напечатает программа? Каждая строка вывода — на новой строке.' +
      '<textarea class="py-predict-input" rows="2"' + EDIT_ATTRS + (finished ? ' disabled' : '') + ' aria-label="Ответ">' + esc(m.input || '') + '</textarea></label>';
    if (!finished) {
      h += '<div class="row"><button type="button" class="run-btn" data-act="py-predict" data-id="' + t.id + '">Проверить</button>';
      if (m.tries) h += '<button type="button" class="ghost small" data-act="py-show" data-id="' + t.id + '">Показать ответ</button>';
      h += '</div>';
      if (m.tries) h += '<p class="run-diff">Не совпадает. Пройди по коду строка за строкой и попробуй ещё.</p>';
    } else {
      h += '<p class="' + (m.solved ? 'run-ok' : 'code-label') + '">' + (m.solved ? 'Верно.' : 'Ответ') + '</p>' + codeBlock(t.expected);
      h += '<p class="why">' + fmt(t.why) + '</p>';
      h += traceHtml(t);
    }
    return h;
  }

  // ---------- пошаговое выполнение ----------
  // Шаги записаны генератором при запуске кода в Python 3.13: строка, переменные до неё, вывод к этому моменту.

  function traceHtml(t) {
    if (!t.trace) return '';
    var m = pyMem[t.id] || {};
    if (m.step === undefined) return '<div class="row"><button type="button" class="ghost small" data-act="py-trace" data-id="' + t.id + '">▶ Пройти по шагам</button>' +
      '<span class="hint">Посмотреть, какая строка выполняется и как меняются переменные</span></div>';
    var steps = t.trace.steps, k = Math.max(0, Math.min(m.step, steps.length - 1)), st = steps[k];
    var prev = k > 0 ? steps[k - 1] : null;
    var lines = t.code.split("\n");
    var where = st.scope === "lambda" ? "в lambda" : st.scope === "генератор" ? "в генераторе" : st.scope ? "в функции " + st.scope : "";
    var status;
    if (st.line === -1) status = 'Программа закончилась.';
    else if (st.ret !== undefined) status = (st.scope === "lambda" ? 'lambda' : 'Функция <code>' + esc(st.scope) + '</code>') + ' возвращает <code>' + esc(st.ret) + '</code>.';
    else status = 'Сейчас выполнится строка ' + (st.line + 1) + (where ? ' ' + esc(where) : '') + '.';
    var h = '<div class="py-trace" aria-live="polite"><p class="code-label">Шаг ' + (k + 1) + ' из ' + steps.length + '</p>';
    h += '<pre class="py-code trace-code"><code>' + lines.map(function (l, i) {
      return '<span class="tl' + (i === st.line ? ' cur' : '') + '"><span class="ln" aria-hidden="true">' + (i + 1) + '</span>' + (esc(l) || ' ') + '</span>';
    }).join('') + '</code></pre>';
    h += '<p class="trace-status">' + status + '</p>';
    var old = {};
    if (prev && prev.scope === st.scope) prev.vars.forEach(function (v) { old[v[0]] = v[1]; });
    h += '<p class="code-label">Переменные' + (where ? ' ' + esc(where) : '') + '</p>';
    if (st.vars.length) {
      h += '<table class="trace-vars"><tbody>' + st.vars.map(function (v) {
        var changed = prev && prev.scope === st.scope && old[v[0]] !== v[1];
        return '<tr' + (changed ? ' class="changed"' : '') + '><th scope="row"><code>' + esc(v[0]) + '</code></th><td><code>' + esc(v[1]) + '</code>' +
          (changed ? ' <span class="trace-new">' + (v[0] in old ? 'изменилась' : 'новая') + '</span>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>';
    } else h += '<p class="hint">Пока нет ни одной.</p>';
    h += '<p class="code-label">Напечатано к этому моменту</p>' + (st.out ? codeBlock(st.out.replace(/\n$/, "")) : '<p class="hint">Пока ничего.</p>');
    h += '<div class="row trace-nav"><button type="button" class="ghost" data-act="py-step" data-d="-1" data-id="' + t.id + '"' + (k === 0 ? ' disabled' : '') + '>◀ Назад</button>' +
      '<button type="button" class="run-btn" data-act="py-step" data-d="1" data-id="' + t.id + '"' + (k === steps.length - 1 ? ' disabled' : '') + '>Дальше ▶</button>' +
      '<button type="button" class="ghost small" data-act="py-trace-close" data-id="' + t.id + '">Закрыть</button></div>';
    if (t.trace.cut) h += '<p class="hint">Показаны первые шаги, дальше программа повторяет то же самое.</p>';
    return h + '</div>';
  }

  function checkPredict(id) {
    var t = pyTask(id), m = pyMem[id] = pyMem[id] || {};
    var box = app.querySelector(".py-predict-input");
    m.input = box ? box.value : "";
    if (!m.input.trim()) return;
    if (normalizeOut(m.input) === normalizeOut(t.expected)) { m.solved = true; pyDone(id, !m.tries); }
    else m.tries = (m.tries || 0) + 1;
    rerenderInPlace();
  }

  function showPyAnswer(id) {
    var m = pyMem[id] = pyMem[id] || {};
    m.shown = true;
    pyDone(id, false);
    rerenderInPlace();
  }

  function fillHtml(t) {
    var m = pyMem[t.id] || {};
    var finished = m.solved || m.shown;
    var h = '<pre class="py-code"><code>';
    t.lines.forEach(function (line, i) {
      if (i === t.gapLine) {
        h += esc(t.before) + (finished ? '<mark>' + esc(m.shown && !m.solved ? t.answer : m.input) + '</mark>'
          : '<input type="text" class="fill-input" size="' + Math.max(8, t.answer.length + 4) + '"' + EDIT_ATTRS +
            ' value="' + esc(m.input || '') + '" aria-label="Пропущенный код">') + esc(t.after);
      } else h += esc(line);
      h += '\n';
    });
    h += '</code></pre>';
    h += '<p class="hint">Программа должна напечатать:</p>' + codeBlock(t.expected);
    if (!finished) {
      h += '<div class="row"><button type="button" class="run-btn" data-act="py-fill" data-id="' + t.id + '">Запустить и проверить</button>';
      if ((m.tries || 0) >= 2) h += '<button type="button" class="ghost small" data-act="py-show" data-id="' + t.id + '">Показать ответ</button>';
      h += '</div>';
    }
    h += '<div class="py-result" aria-live="polite">' + (m.resultHtml || '') + '</div>';
    if (finished) h += '<p class="why">' + (m.solved ? '<strong>Верно.</strong> ' : '<strong>Ответ:</strong> <code>' + esc(t.answer) + '</code>. ') + fmt(t.why || '') + '</p>';
    return h;
  }

  function pyRun(id, code, statusEl) {
    var key = "pyt:" + id;
    return Runner.reset(key).then(function () {
      return Runner.run(code, key, function (msg) { if (statusEl) statusEl.innerHTML = '<p class="run-status">' + esc(msg) + '</p>'; });
    });
  }

  function runFailedHtml(e) {
    return '<p class="run-diff">' + esc(navigator.onLine ? 'Не получилось запустить Python: ' + (e && e.message || e) :
      'Python ещё не скачан для работы без интернета. Подключись к интернету один раз или нажми на главной «Скачать Python для офлайна».') + '</p>';
  }

  async function checkFill(id) {
    var t = pyTask(id), m = pyMem[id] = pyMem[id] || {};
    var input = app.querySelector(".fill-input");
    m.input = input ? input.value : "";
    if (!m.input.trim()) return;
    var lines = t.lines.slice();
    lines[t.gapLine] = t.before + m.input + t.after;
    var out = app.querySelector(".py-result");
    if (out) out.innerHTML = '<p class="run-status">Запускаю…</p>';
    try {
      var r = await pyRun(id, lines.join("\n"), out);
      var ok = !r.error && normalizeOut(r.out) === normalizeOut(t.expected);
      m.resultHtml = ok ? '' : (r.error ? errorBoxHtml(id, r.error) : '<p class="run-diff">Программа напечатала другое:</p>' + codeBlock(r.out || '(ничего)'));
      if (ok) { m.solved = true; pyDone(id, !m.tries); }
      else m.tries = (m.tries || 0) + 1;
    } catch (e) {
      m.resultHtml = runFailedHtml(e);
    }
    rerenderInPlace();
  }

  function errorBoxHtml(id, err) {
    return '<div class="run-error"><p><strong>' + esc(err.text) + '</strong></p>' + (err.hint ? '<p>' + esc(err.hint) + '</p>' : '') +
      '<div class="row"><a class="link" href="#python/errors">Разбор ошибок</a>' +
      '<button type="button" class="ghost small" data-act="py-ask" data-id="' + id + '">Спросить Claude</button></div></div>';
  }

  function writeHtml(t) {
    var s = pyState(), m = pyMem[t.id] || {};
    var code = s.code[t.id] ? s.code[t.id].text : t.starter;
    var hints = s.hints[t.id] || 0;
    var h = '<p class="hint">Напиши код в поле. Проверка запустит его в браузере на нескольких примерах.</p>';
    h += '<textarea class="code-edit py-write" rows="' + Math.max(6, code.split("\n").length + 2) + '"' + EDIT_ATTRS +
      ' data-py-code="' + t.id + '" aria-label="Твой код">' + esc(code) + '</textarea>';
    h += '<p class="code-label">Проверка</p><ul class="py-tests">' + t.tests.map(function (c) { return '<li><code>' + esc(c) + '</code></li>'; }).join('') + '</ul>';
    h += '<div class="row"><button type="button" class="run-btn" data-act="py-write" data-id="' + t.id + '">Проверить</button>';
    if (hints < t.hints.length && !m.solved) h += '<button type="button" class="ghost small" data-act="py-hint" data-id="' + t.id + '">Подсказка ' + (hints + 1) + ' из ' + t.hints.length + '</button>';
    if (!m.solved && !m.shown && ((m.fails || 0) >= 2 || hints >= t.hints.length)) h += '<button type="button" class="ghost small" data-act="py-show" data-id="' + t.id + '">Показать решение</button>';
    if (s.code[t.id]) h += '<button type="button" class="ghost small" data-act="py-reset-code" data-id="' + t.id + '">Вернуть заготовку</button>';
    h += '</div>';
    for (var i = 0; i < hints; i++) h += '<p class="py-hint"><strong>Подсказка ' + (i + 1) + '.</strong> ' + fmt(t.hints[i]) + '</p>';
    h += '<div class="py-result" aria-live="polite">' + (m.resultHtml || '') + '</div>';
    if (m.solved) h += '<p class="run-ok">Все проверки пройдены.</p>';
    if (m.shown) h += '<p class="code-label">Решение</p>' + codeBlock(t.solution) +
      '<p class="hint">Разбери решение, потом сотри своё и напиши заново, не подглядывая. Задача вернётся в разминку завтра.</p>';
    return h;
  }

  async function checkWrite(id) {
    var t = pyTask(id), s = pyState(), m = pyMem[id] = pyMem[id] || {};
    var box = app.querySelector("textarea[data-py-code]");
    var code = box ? box.value : t.starter;
    s.code[id] = { text: code, at: Date.now() };
    var out = app.querySelector(".py-result");
    if (out) out.innerHTML = '<p class="run-status">Запускаю…</p>';
    try {
      var r = await pyRun(id, code + "\n\n" + (t.setup || "") + "\n" + t.testsPy + PT().harness, out);
      var text = r.out || "", at = text.lastIndexOf("@@RESULTS@@");
      if (r.error || at === -1) {
        m.fails = (m.fails || 0) + 1;
        m.resultHtml = r.error ? errorBoxHtml(id, r.error) : '<p class="run-diff">Проверка не запустилась.</p>';
      } else {
        var res = JSON.parse(text.slice(at + 11));
        var printed = text.slice(0, at).trim();
        var passed = res.filter(function (x) { return x[2]; }).length;
        var hh = '<ul class="py-results">', tipsShown = {};
        res.forEach(function (x) {
          hh += '<li class="' + (x[2] ? 'ok' : 'no') + '"><span>' + (x[2] ? '✓' : '✕') + '</span> <code>' + esc(x[0]) + '</code>' +
            (x[2] ? '' : '<br>получилось <code>' + esc(x[1]) + '</code>, а нужно <code>' + esc(x[3]) + '</code>' +
              (function (tip) {
                if (!tip || tipsShown[tip]) return '';
                tipsShown[tip] = true;
                return '<span class="test-tip">💡 ' + fmt(tip) + '</span>';
              })(diagnoseTest(x[1], x[3], printed))) + '</li>';
        });
        hh += '</ul>';
        if (printed) hh += '<p class="code-label">Твой код напечатал</p>' + codeBlock(printed);
        m.resultHtml = hh;
        if (passed === res.length) {
          m.solved = true;
          pyDone(id, !m.fails && !m.shown && (s.hints[id] || 0) < t.hints.length);
        } else m.fails = (m.fails || 0) + 1;
      }
    } catch (e) {
      m.resultHtml = runFailedHtml(e);
    }
    save();
    rerenderInPlace();
  }

  // Почему тест не прошёл: типичные причины по тому, что получилось и что нужно
  var KINDS = { int: "целое число", float: "дробное число", str: "строка", list: "список", dict: "словарь", set: "множество",
    tuple: "кортеж", bool: "True или False", none: "None" };

  function reprKind(r) {
    if (r === "None") return "none";
    if (r === "True" || r === "False") return "bool";
    if (/^-?\d+$/.test(r)) return "int";
    if (/^-?(\d+\.\d*|\.\d+|\d+)(e[-+]?\d+)?$/.test(r) || r === "inf" || r === "nan") return "float";
    if (/^['"]/.test(r)) return "str";
    if (r[0] === "[") return "list";
    if (r[0] === "(") return "tuple";
    if (r === "{}" || /^\{.*:/.test(r)) return "dict";
    if (r[0] === "{" || r === "set()") return "set";
    return "";
  }

  function reprItems(r) {
    var inner = r.slice(1, -1).trim();
    return inner ? inner.split(/,\s*/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
  }

  function unquote(r) { return reprKind(r) === "str" ? r.slice(1, -1) : r; }

  function diagnoseTest(got, exp, printed) {
    got = String(got).replace(/np\.\w+\(([^()]*)\)/g, "$1");   // np.float64(0.5) → 0.5
    var err = /^([A-Z]\w*(Error|Exception))\b/.exec(got);
    if (err) {
      var name = err[1];
      if (name === "TypeError" && /missing \d+ required|takes \d+ positional|positional argument/.test(got))
        return "Функция принимает не столько аргументов, сколько передаёт проверка. Сравни параметры в `def` с вызовом в проверке.";
      if (name === "TypeError" && /NoneType/.test(got))
        return "Где-то вместо значения оказался None. Частая причина — результат `append`, `sort` или функции без `return`: они возвращают None.";
      if (name === "TypeError") return "Действие с неподходящим типом, например строка плюс число. Посмотри тип значения: `print(type(x))`.";
      if (name === "NameError") return "Python не знает это имя: опечатка, переменная ещё не создана или забыт `import`.";
      if (name === "IndexError") return "Номер за пределами списка. Номера идут с 0, последний — `len(x) - 1`. Проверь и пустой список.";
      if (name === "KeyError") return "Такого ключа нет в словаре. Для подсчёта удобно `d.get(ключ, 0)`.";
      if (name === "ZeroDivisionError") return "Деление на ноль. Проверь случай, когда список пустой или делитель равен нулю.";
      if (name === "AttributeError") return "У этого значения нет такого метода или поля. Проверь его тип и не забыт ли `self.`.";
      if (name === "ValueError") return "Тип подходящий, но значение нет: например, `int(\"x\")` или при распаковке не столько переменных, сколько значений.";
      if (name === "UnboundLocalError") return "Переменную читают раньше, чем ей что-то присвоено внутри функции.";
      return "";
    }
    var gk = reprKind(got), ek = reprKind(exp);
    if (gk === "none") {
      if (printed && printed.indexOf(unquote(exp)) !== -1)
        return "Функция печатает ответ через `print`, а проверка ждёт `return`. Замени `print(...)` на `return`.";
      return "Функция ничего не вернула. Нужен `return`, и он должен выполниться: проверь, что он не спрятан в условии или цикле, которые не сработали.";
    }
    if (gk === "bool" && ek === "bool") return "Получилось противоположное. Проверь условие: знак сравнения, `not`, особые случаи вроде заглавных букв или пустого значения.";
    if ((gk === "int" || gk === "float") && (ek === "int" || ek === "float")) {
      var g = Number(got), e = Number(exp);
      if (g === e && gk === "float") return "`/` всегда даёт дробное число. Нужно целое — используй `//` или `int()`.";
      if (g === e) return "Нужно дробное число, а получилось целое. Проверь, не `//` ли вместо `/`.";
      if (Math.abs(g - e) === 1) return "Ответ отличается на 1. Проверь границы: `range(n)` не включает `n`, а `>` и `>=` отличаются ровно на одно значение.";
      if (gk === "float" && ek === "float" && Math.abs(g - e) < 0.01) return "Почти совпало. Проверь округление: `round(x, 2)`.";
      if (e !== 0 && Math.abs(g / e - 100) < 1e-9) return "Получилось в 100 раз больше: возможно, проценты посчитаны дважды.";
      return "";
    }
    if (gk && ek && gk !== ek) {
      var tip = "Тип не тот: получилось " + KINDS[gk] + ", а нужно " + KINDS[ek] + ".";
      if (gk === "str" && unquote(got) === exp) tip += " Не превращай результат в строку: верни само значение.";
      else if (ek === "str") tip += " Возможно, нужно собрать строку, например f-строкой.";
      return tip;
    }
    if (gk === "str" && ek === "str") {
      var a = unquote(got), b = unquote(exp);
      if (a.toLowerCase() === b.toLowerCase()) return "Отличаются только заглавные и строчные буквы: проверь `lower()`, `upper()` или `title()`.";
      if (a.trim() === b.trim()) return "Лишние пробелы в начале или в конце. Поможет `strip()`.";
      if (a.replace(/\s+/g, "") === b.replace(/\s+/g, "")) return "Отличаются пробелы между частями. Сравни строку посимвольно с нужной.";
      return "";
    }
    if (gk === ek && (gk === "list" || gk === "tuple")) {
      var gi = reprItems(got), ei = reprItems(exp);
      if (gi.length === ei.length && gi.slice().sort().join("|") === ei.slice().sort().join("|"))
        return "Элементы верные, но порядок другой. Проверь сортировку, `key` и `reverse=True`.";
      if (gi.length !== ei.length) return "Элементов " + gi.length + ", а нужно " + ei.length + ". Проверь условие отбора и границы цикла.";
    }
    if (gk === "dict" && ek === "dict") {
      var keys = function (r) { return reprItems(r).map(function (x) { return x.split(":")[0]; }).sort().join("|"); };
      if (keys(got) === keys(exp)) return "Ключи верные, а значения нет. Проверь, как считается значение для каждого ключа.";
      return "Ключи не совпадают. Проверь, что именно становится ключом.";
    }
    return "";
  }

  function askPy(id) {
    var t = pyTask(id);
    var code = t.type === "write" ? (pyState().code[id] || {}).text || t.starter : (pyMem[id] || {}).input || "";
    var err = app.querySelector(".py-result .run-error strong");
    openClaude("Я учу Python. Задача: " + (t.task || "") + "\n\nМой код:\n" + code + "\n\nОшибка:\n" + (err ? err.textContent : "") +
      "\n\nОбъясни по-русски, что значит ошибка и в какую сторону думать. Не пиши готовое решение целиком.");
  }

  function viewPyErrors() {
    var E = PT().errors;
    var h = '<a class="back" href="#python">← Тренажёр</a>';
    h += '<header class="phead"><p class="eyebrow">Справочник</p><h1>Разбор ошибок Python</h1>';
    h += '<p class="lead">Ошибка — не провал, а подсказка: Python говорит, что и где пошло не так. Все сообщения ниже получены запуском этого кода в Python 3.13.</p></header>';
    h += '<section class="panel"><h2>Как читать сообщение об ошибке</h2>';
    h += '<p>Программа в файле <code>poem.py</code>:</p>' + codeBlock(E.traceback.code);
    h += '<p>Python напечатал:</p><pre class="py-code py-err"><code>' + esc(E.traceback.text) + '</code></pre>';
    h += '<p><strong>Читай снизу вверх.</strong> Последняя строка — тип ошибки и объяснение. Над ней — строка кода, где ошибка случилась, и номер этой строки. ' +
      'Ещё выше — откуда эту функцию вызвали. Здесь функция поделила на длину пустого списка, то есть на ноль, а вызвали её в строке 5.</p></section>';
    E.items.forEach(function (e) {
      h += '<section class="panel" id="err-' + e.name + '"><h2>' + esc(e.name) + '</h2><p>' + fmt(e.meaning) + '</p>';
      h += codeBlock(e.code) + '<pre class="py-code py-err"><code>' + esc(e.message) + '</code></pre>';
      h += '<p><strong>Что делать.</strong> ' + fmt(e.how) + '</p>';
      if (e.fixed) h += '<p class="code-label">Исправлено</p>' + codeBlock(e.fixed) + (e.fixedOut ? '<p class="code-label">Выводит</p>' + codeBlock(e.fixedOut) : '');
      h += '</section>';
    });
    app.innerHTML = h;
  }

  function viewLesson(p, t) {
    var idx = p.theory.indexOf(t);
    var backHref = '#' + p.id + (isIntro(p) ? '' : '/theory');
    var h = '';
    h += '<a class="back" href="' + backHref + '">← ' + (isIntro(p) ? esc(p.title) : 'Уроки проекта') + '</a>';
    h += '<header class="phead">';
    h += '<p class="eyebrow">Урок ' + (idx + 1) + ' из ' + p.theory.length + ' · ' + esc(t.time) + '</p>';
    h += '<h1>' + esc(t.title) + '</h1>';
    h += '<label class="toggle"><input type="checkbox" data-setting="predict"' + (predictOn() ? ' checked' : '') +
      '> Сначала угадывать, что напечатает код</label>';
    h += '</header>';
    var parts = lessonParts(t);
    h += resumeHtml(p, t);
    h += tocHtml(p, t, parts);

    h += '<section class="panel why-box"><h2>Зачем это нужно</h2><p>' + fmt(t.why) + '</p></section>';

    t.sections.forEach(function (s, si) {
      h += '<section class="panel" id="sec-' + si + '" data-sec="' + si + '"><h2>' + esc(s.h) + '</h2>';
      s.p.forEach(function (x) { h += '<p>' + fmt(x) + '</p>'; });
      if (s.code) h += sectionRunnable(s) ? runBox(p, t, 's' + si, s.code) : codeBlock(s.code);
      if (s.out) h += predictOn() ? predictBlock(blockId(p, t, 's' + si), s.out) : codeBlock(s.out, 'Что напечатает программа');
      if (s.widget && window.Widgets) h += widgetHtml(blockId(p, t, 'w' + si), s.widget);
      if (s.note) h += '<p class="note">' + fmt(s.note) + '</p>';
      h += sectionChecksHtml(p, t, si);
      h += '</section>';
      if (si < t.sections.length - 1 && parts.of[si] !== parts.of[si + 1]) {
        h += '<p class="part-end">Конец части ' + (parts.of[si] + 1) + ' из ' + parts.count +
          '. Хорошее место для перерыва: приложение запомнит, где ты остановился.</p>';
      }
    });

    h += englishHtml(p, t);

    if (t.mistakes) {
      h += '<section class="panel"><h2>Частые ошибки</h2><ul class="mistakes">';
      t.mistakes.forEach(function (m) {
        h += '<li><p class="bad">' + fmt(m.bad) + '</p><p class="fix">' + fmt(m.fix) + '</p></li>';
      });
      h += '</ul></section>';
    }

    if (t.practice) {
      h += '<section class="panel" id="practice"><h2>Попробуй сам</h2>';
      h += '<p class="hint">Сначала реши, потом открывай решение. Подсмотренное решение ничему не учит.</p>';
      t.practice.forEach(function (x, i) {
        h += '<div class="task"><p><strong>Задание ' + (i + 1) + '.</strong> ' + fmt(x.task) + '</p>';
        if (practiceRunnable(x)) {
          h += userBox(p, t, i);
          h += '<details><summary>Показать решение</summary>' + runBox(p, t, 'p' + i, x.solution) + '</details></div>';
        } else {
          h += '<details><summary>Показать решение</summary>' + codeBlock(x.solution) + '</details></div>';
        }
      });
      h += '</section>';
    }

    if (t.terms) {
      h += '<section class="panel"><h2>Словарик</h2>';
      h += '<p class="hint">Термины на английском: так они называются в документации, вакансиях и на собеседованиях.</p>';
      h += '<dl class="terms">';
      t.terms.forEach(function (x) { h += '<dt>' + esc(x[0]) + sayBtn(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; });
      h += '</dl>';
      if (state.termsAdded[p.id + "." + t.id]) {
        h += '<p class="hint terms-added">✓ Термины этого урока в повторении.</p>';
      } else {
        h += '<button type="button" class="ghost small" data-act="add-terms" data-p="' + p.id + '" data-t="' + t.id +
          '">Учить эти термины в повторении</button>';
        h += '<p class="hint">Добавятся сами, когда ответишь на все вопросы квиза.</p>';
      }
      h += '</section>';
    }

    h += drillsHtml(p, t);
    h += quizHtml(p, t);
    h += noteHtml(p, t);
    h += askHtml();

    if (t.sources && t.sources.length) {
      h += '<section class="panel"><h2>Источники</h2><ul class="plain">';
      t.sources.forEach(function (s) {
        h += '<li><a class="link" href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a></li>';
      });
      h += '</ul></section>';
    }

    var prev = p.theory[idx - 1], next = p.theory[idx + 1];
    h += '<nav class="pager">';
    h += prev ? '<a href="#' + p.id + '/theory/' + prev.id + '">← ' + esc(prev.title) + '</a>' : '<span></span>';
    h += next ? '<a class="pager-next" href="#' + p.id + '/theory/' + next.id + '">' + esc(next.title) + ' →</a>'
              : '<a class="pager-next" href="' + (isIntro(p) ? '#' : backHref) + '">' + (isIntro(p) ? 'К проектам →' : 'К списку уроков →') + '</a>';
    h += '</nav>';

    app.innerHTML = h;
  }

  function quizHtml(p, t) {
    var s = lessonScore(p, t);
    if (t.sectionQuiz) return quizSummaryHtml(p, t, s);
    var h = '<section class="panel" id="quiz"><div class="quiz-head"><h2>Проверь себя</h2><span class="hint">' +
      s.right + ' из ' + s.total + '</span></div>';
    t.quiz.forEach(function (q, qi) { h += questionHtml(p, t, qi); });
    h += '<button type="button" class="ghost" data-act="reset-quiz" data-prefix="' + p.id + "." + t.id + '.">Пройти заново</button>';
    return h + '</section>';
  }

  function quizSummaryHtml(p, t, s) {
    var answered = t.quiz.filter(function (_, qi) { return state.quiz[qKey(p, t, qi)] !== undefined; }).length;
    var h = '<section class="panel" id="quiz"><div class="quiz-head"><h2>Итог урока</h2><span class="hint">верно ' +
      s.right + ' из ' + s.total + '</span></div>';
    if (answered < t.quiz.length) {
      var missed = [];
      t.sectionQuiz.forEach(function (qs, si) {
        if (qs.some(function (qi) { return state.quiz[qKey(p, t, qi)] === undefined; })) missed.push(si);
      });
      h += '<p>Отвечено ' + answered + ' из ' + t.quiz.length + ' вопросов. Вопросы стоят после разделов, где разбирается их тема. Без ответа остались разделы:</p><ul class="plain">';
      missed.forEach(function (si) {
        h += '<li><button type="button" class="link-btn" data-act="goto-sec" data-i="' + si + '">' + esc(t.sections[si].h) + '</button></li>';
      });
      h += '</ul>';
    } else {
      h += '<p>' + (s.right === s.total ? 'Все ответы верные.' : 'Вопросы с ошибками попали в повторение: они вернутся завтра.') + '</p>';
    }
    h += '<button type="button" class="ghost" data-act="reset-quiz" data-prefix="' + p.id + "." + t.id + '.">Ответить на все вопросы заново</button>';
    return h + '</section>';
  }

  function questionHtml(p, t, qi) {
      var q = t.quiz[qi];
      var key = qKey(p, t, qi);
      var picked = state.quiz[key];
      var answered = picked !== undefined;
      var h = '<fieldset class="q"><legend>' + fmt(q.q) + '</legend>';
      // порядок вариантов постоянный для вопроса, но правильный не всегда первый
      order(q.options.length, qi * 31 + q.q.length + q.options[0].length).forEach(function (oi) {
        var cls = "opt";
        if (answered && oi === q.answer) cls += " right";
        else if (answered && oi === picked) cls += " wrong";
        h += '<button type="button" class="' + cls + '" data-act="answer" data-key="' + key + '" data-i="' + oi + '"' +
          (answered ? ' disabled' : '') + '>' + esc(q.options[oi]) + '</button>';
      });
      if (answered) {
        h += '<p class="why"><strong>' + (picked === q.answer ? 'Верно.' : 'Неверно.') + '</strong> ' + fmt(q.why) + '</p>';
      }
      return h + '</fieldset>';
  }

  function sectionChecksHtml(p, t, si) {
    var qs = t.sectionQuiz && t.sectionQuiz[si];
    if (!qs || !qs.length) return '';
    var h = '<div class="sec-check"><p class="sec-check-label">Проверь себя</p>';
    qs.forEach(function (qi) { h += questionHtml(p, t, qi); });
    return h + '</div>';
  }

  // Детерминированная перестановка индексов 0..n-1: правильный ответ попадает на разные места
  function order(n, seed) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    var hash = Math.imul(seed + 1, 2654435761) >>> 0;
    var shift = (hash >>> 16) % n;
    a = a.slice(shift).concat(a.slice(0, shift));
    if ((hash >>> 8) % 2) { var first = a.shift(); a.reverse(); a.unshift(first); }
    return a;
  }

  // ---------- план и готовность ----------

  function checkbox(group, key, text) {
    var on = !!state[group][key];
    return '<label class="check' + (on ? ' on' : '') + '"><input type="checkbox" data-group="' + group +
      '" data-key="' + key + '"' + (on ? ' checked' : '') + '><span>' + esc(text) + '</span></label>';
  }

  function planHtml(p) {
    var h = '';
    p.plan.forEach(function (w, wi) {
      var done = w.tasks.filter(function (_, ti) { return state.tasks[tKey(p, wi, ti)]; }).length;
      h += '<section class="panel"><div class="quiz-head"><h2>' + esc(w.title) + '</h2><span class="hint">' +
        done + ' из ' + w.tasks.length + '</span></div>';
      w.tasks.forEach(function (t, ti) { h += checkbox("tasks", tKey(p, wi, ti), t); });
      h += '</section>';
    });
    return h;
  }

  function readyHtml(p) {
    var h = '<section class="panel"><h2>Проект готов, когда</h2>';
    p.criteria.forEach(function (c, ci) { h += checkbox("criteria", p.id + ".c" + ci, c); });
    h += '</section>';
    h += '<section class="panel"><h2>Ссылка на репозиторий</h2>';
    h += '<p class="hint">Рекомендуемое имя: ' + esc(p.repoName) + '</p>';
    h += '<input type="url" id="repo" inputmode="url" placeholder="https://github.com/..." value="' + esc(state.repo[p.id] || '') +
      '" data-pid="' + p.id + '" aria-label="Ссылка на репозиторий">';
    if (state.repo[p.id]) {
      h += '<p><a class="link" href="' + esc(state.repo[p.id]) + '" target="_blank" rel="noopener">Открыть репозиторий</a></p>';
      h += '<button type="button" class="run-btn" data-act="repo-check" data-pid="' + p.id + '">Проверить репозиторий</button>';
      h += '<div id="repo-report" aria-live="polite">' + repoReportHtml(state.repoCheck[p.id]) + '</div>';
    }
    h += '</section>';
    return h;
  }

  // ---------- маршрутизация и события ----------

  function parts() { return location.hash.replace(/^#/, "").split("/"); }

  var jumpedHash = null;   // переход к разделу по ссылке делается один раз, а не при каждой перерисовке

  function render() {
    lessonCtx = null;
    var a = parts();
    var p = project(a[0]);
    if (a[0] === "review") { viewReview(); return; }
    if (a[0] === "glossary") { viewGlossary(); return; }
    if (a[0] === "diagnostic") { viewDiagnostic(); return; }
    if (a[0] === "notes") { viewNotes(); return; }
    if (a[0] === "python") { viewPython(a[1], a[2]); return; }
    if (a[0] === "interview") { viewInterview(a[1]); return; }
    if (!p) { viewHome(); return; }
    if (a[1] === "theory" && a[2] && hasLessons(p)) {
      var t = p.theory.filter(function (x) { return x.id === a[2]; })[0];
      if (t) {
        viewLesson(p, t);
        lessonCtx = { p: p, t: t, cur: -2 };
        var m = /^s(\d+)$/.exec(a[3] || "");
        if (m && jumpedHash !== location.hash) {
          jumpedHash = location.hash;
          setTimeout(function () { gotoSection(m[1]); }, 0);
        }
        return;
      }
    }
    var tab = TABS.some(function (t) { return t[0] === a[1]; }) ? a[1] : "brief";
    viewProject(p, tab);
  }

  // Страница = проект + урок. Переключение вкладок внутри проекта не прокручивает наверх.
  function pageKey() { var a = parts(); return a[0] + "|" + (a[2] || ""); }

  var lastPage = pageKey();
  window.addEventListener("hashchange", function () {
    jumpedHash = null;
    var now = pageKey();
    render();
    if (now !== lastPage) window.scrollTo(0, 0);
    lastPage = now;
  });

  app.addEventListener("change", function (e) {
    var el = e.target;
    if (el.dataset && el.dataset.settingNum) {
      state.settings[el.dataset.settingNum] = Number(el.value);
      save();
      rerenderInPlace();
      return;
    }
    if (el.dataset && el.dataset.setting) {
      state.settings[el.dataset.setting] = el.checked;
      save();
      rerenderInPlace();
      return;
    }
    if (el.type === "checkbox" && el.dataset.key) {
      if (el.checked) markActive();
      if (el.checked) state[el.dataset.group][el.dataset.key] = true;
      else delete state[el.dataset.group][el.dataset.key];
      save();
      render();
    }
    if (el.id === "repo") {
      var v = el.value.trim();
      if (v && !/^https?:\/\//i.test(v)) v = "https://" + v;
      if (v) state.repo[el.dataset.pid] = v; else delete state.repo[el.dataset.pid];
      save();
      render();
    }
  });

  // Перерисовка не должна сдвигать страницу и закрывать открытые решения
  function rerenderInPlace() {
    var y = window.scrollY;
    var open = [];
    app.querySelectorAll("details").forEach(function (d, i) { if (d.open) open.push(i); });
    render();
    app.querySelectorAll("details").forEach(function (d, i) { if (open.indexOf(i) !== -1) d.open = true; });
    window.scrollTo(0, y);
  }

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.dataset.act;

    var box = el.closest(".runbox");
    if (box) {
      if (act === "run") { handleRun(box, false); return; }
      if (act === "check") { handleRun(box, true); return; }
      if (act === "edit" || act === "restore") { handleEdit(box, act); return; }
      if (act === "reset-space") { handleResetSpace(box); return; }
    }

    if (act === "offline-download") { downloadOffline(); return; }
    if (act === "ask-claude") { askClaude(el); return; }
    if (act === "ask-error") { askAboutError(el.closest(".runbox")); return; }
    if (act === "bug-pick") { pickBug(el.dataset.key, Number(el.dataset.line)); return; }
    if (act === "bug-show") {
      (drillMem[el.dataset.key] = drillMem[el.dataset.key] || {}).shown = true;
      if (isPyKey(el.dataset.key)) pyDone(pyIdOf(el.dataset.key), false);
      rerenderInPlace(); return;
    }
    if (act === "order-add" || act === "order-remove") { moveOrder(el.dataset.key, Number(el.dataset.i), act === "order-add"); return; }
    if (act === "order-check") { checkOrder(el.dataset.key); return; }
    if (act === "order-reset") { drillMem[el.dataset.key] = {}; rerenderInPlace(); return; }
    if (act === "exam-start") { startExam(el.dataset.pid); return; }
    if (act === "exam-answer") { answerExam(el.dataset.pid, Number(el.dataset.n), Number(el.dataset.i)); return; }
    if (act === "exam-next") { examNext(el.dataset.pid); return; }
    if (act === "repo-check") { checkRepo(project(el.dataset.pid)); return; }
    if (act === "notes-download") { downloadNotes(); return; }
    if (act === "goto-sec") { gotoSection(el.dataset.i); return; }
    if (act === "py-predict") { checkPredict(el.dataset.id); return; }
    if (act === "py-trace" || act === "py-step" || act === "py-trace-close") {
      var tm = pyMem[el.dataset.id] = pyMem[el.dataset.id] || {};
      if (act === "py-trace") tm.step = 0;
      else if (act === "py-step") tm.step = (tm.step || 0) + Number(el.dataset.d);
      else delete tm.step;
      rerenderInPlace();
      var cur = app.querySelector(act === "py-trace-close" ? "[data-act=py-trace]" : "[data-act=py-step][data-d='" + (act === "py-step" ? el.dataset.d : "1") + "']");
      if (cur && !cur.disabled) cur.focus({ preventScroll: true });
      return;
    }
    if (act === "py-show") { showPyAnswer(el.dataset.id); return; }
    if (act === "py-fill") { checkFill(el.dataset.id); return; }
    if (act === "py-write") { checkWrite(el.dataset.id); return; }
    if (act === "py-hint") { var hs = pyState().hints; hs[el.dataset.id] = (hs[el.dataset.id] || 0) + 1; save(); rerenderInPlace(); return; }
    if (act === "py-reset-code") { delete pyState().code[el.dataset.id]; save(); rerenderInPlace(); return; }
    if (act === "py-ask") { askPy(el.dataset.id); return; }
    if (act === "py-daily-next") { pyState().daily.idx++; save(); render(); window.scrollTo(0, 0); return; }
    if (act === "say") { say(el.dataset.text); return; }
    if (act === "iv-voice") { toggleVoice(el.dataset.id, el); return; }
    if (act === "iv-reveal") { ivEntry(el.dataset.id).revealed = true; save(); rerenderInPlace(); return; }
    if (act === "iv-claude") { askClaudeInterview(el.dataset.id); return; }
    if (act === "iv-random") { randomInterview(el.dataset.pid); return; }
    if (act === "sync-connect") { connectSync(); return; }
    if (act === "sync-now") { syncNow(true); return; }
    if (act === "sync-off") { disconnectSync(); return; }
    if (act === "log-time") { logTime(Number(el.dataset.min)); return; }
    if (act === "add-terms") { addTerms(project(el.dataset.p), el.dataset.t, 0); save(); rerenderInPlace(); return; }
    if (act === "term-reveal") { reviewShown = { key: el.dataset.key, revealed: true }; render(); return; }
    if (act === "term-grade") { gradeTerm(el.dataset.key, el.dataset.ok === "1"); return; }
    if (act === "diag-start") { state.diag = { answers: {} }; save(); diagShown = null; render(); window.scrollTo(0, 0); return; }
    if (act === "diag-answer") { answerDiag(Number(el.dataset.q), Number(el.dataset.i)); return; }
    if (act === "diag-next") { diagNext(); return; }
    if (act === "diag-reset") { state.diag = {}; save(); diagShown = null; render(); window.scrollTo(0, 0); return; }
    if (act === "reveal") { revealPrediction(el.closest(".predict")); return; }
    if (act === "review-answer") { answerReview(el.dataset.key, Number(el.dataset.i)); return; }
    if (act === "review-next") { reviewShown = null; render(); window.scrollTo(0, 0); return; }

    if (act === "answer") {
      var qi = questionByKey(el.dataset.key);
      markActive();
      if (qi && Number(el.dataset.i) !== qi.q.answer) scheduleReview(el.dataset.key, 0);
      if (qi) {
        state.quiz[el.dataset.key] = Number(el.dataset.i);
        var allAnswered = qi.t.quiz.every(function (_, n) { return state.quiz[qi.p.id + "." + qi.t.id + ".q" + n] !== undefined; });
        if (allAnswered && !state.termsAdded[qi.p.id + "." + qi.t.id]) addTerms(qi.p, qi.t.id, 1);
      }
      save();
      rerenderInPlace();
    }
    if (act === "reset-quiz") {
      Object.keys(state.quiz).forEach(function (k) {
        if (k.indexOf(el.dataset.prefix) === 0) delete state.quiz[k];
      });
      save();
      rerenderInPlace();
    }
    if (act === "export") {
      var box = document.getElementById("sync-box");
      box.value = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
      box.focus();
      box.select();
      msg("Скопируй этот код и вставь его на другом устройстве.");
    }
    if (act === "import") {
      var code = document.getElementById("sync-box").value.trim();
      if (!code) { msg("Сначала вставь код в поле."); return; }
      try {
        var parsed = JSON.parse(decodeURIComponent(escape(atob(code))));
        if (!parsed || typeof parsed !== "object" || !parsed.tasks) throw new Error("bad");
        state = Object.assign(emptyState(), parsed);
        save();
        render();
        var d = document.querySelector(".sync");
        if (d) d.open = true;
        msg("Прогресс загружен.");
      } catch (err) {
        msg("Код не подошёл. Скопируй его заново целиком.");
      }
    }
  });

  function msg(text) {
    var m = document.getElementById("sync-msg");
    if (m) m.textContent = text;
  }

  // ---------- символы над клавиатурой телефона ----------
  // На телефоне до двоеточия, скобок и отступа далеко; ряд кнопок появляется над клавиатурой, пока поле кода в фокусе.

  var SYMS = [["⇥", "    ", "Отступ, 4 пробела"], [":", ":"], ["(", "("], [")", ")"], ["[", "["], ["]", "]"], ["{", "{"], ["}", "}"],
    ['"', '"'], ["'", "'"], ["=", "="], ["_", "_"], [".", "."], [",", ","], ["#", "#"], ["+", "+"],
    ["←", -1, "Курсор влево"], ["→", 1, "Курсор вправо"]];
  var CODE_FIELD = "textarea.code-edit, .fill-input, .py-predict-input";
  var symField = null, symBar = null;
  var coarse = window.matchMedia ? window.matchMedia("(pointer: coarse)") : null;
  var lastTouch = false;                   // планшет с мышью или телефон с клавиатурой: смотрим, чем нажали
  document.addEventListener("pointerdown", function (e) { lastTouch = e.pointerType === "touch"; }, true);

  function symbarEl() {
    if (symBar) return symBar;
    symBar = document.createElement("div");
    symBar.id = "symbar";
    symBar.setAttribute("role", "toolbar");
    symBar.setAttribute("aria-label", "Символы для кода");
    symBar.hidden = true;
    symBar.innerHTML = SYMS.map(function (x, i) {
      return '<button type="button" tabindex="-1" data-sym="' + i + '"' + (x[2] ? ' aria-label="' + x[2] + '"' : '') + '>' + esc(x[0]) + '</button>';
    }).join('');
    function press(e) {
      var b = e.target.closest("button[data-sym]");
      e.preventDefault();
      if (!b || !symField || e.type !== "pointerdown") return;
      var x = SYMS[Number(b.dataset.sym)], f = symField;
      if (typeof x[1] === "number") {
        var p = Math.max(0, Math.min(f.value.length, f.selectionStart + x[1]));
        f.setSelectionRange(p, p);
      } else {
        f.setRangeText(x[1], f.selectionStart, f.selectionEnd, "end");
        f.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (document.activeElement !== f) f.focus({ preventScroll: true });
    }
    ["pointerdown", "mousedown", "click"].forEach(function (ev) { symBar.addEventListener(ev, press); });
    document.body.appendChild(symBar);
    return symBar;
  }

  function placeSymbar() {
    if (!symBar || symBar.hidden) return;
    var vv = window.visualViewport;
    var bottom = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    symBar.style.bottom = bottom + "px";
    if (symField) {
      var r = symField.getBoundingClientRect(), limit = (vv ? vv.height + vv.offsetTop : window.innerHeight) - symBar.offsetHeight - 8;
      var caretBottom = Math.min(r.bottom, r.top + 80);
      if (caretBottom > limit) window.scrollBy(0, caretBottom - limit);
    }
  }

  document.addEventListener("focusin", function (e) {
    var f = e.target;
    if (!f.matches || !f.matches(CODE_FIELD) || f.disabled || !(lastTouch || (coarse && coarse.matches))) return;
    symField = f;
    symbarEl().hidden = false;
    document.body.classList.add("has-symbar");
    placeSymbar();
  });
  document.addEventListener("focusout", function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (a && a.matches && a.matches(CODE_FIELD)) return;
      symField = null;
      if (symBar) symBar.hidden = true;
      document.body.classList.remove("has-symbar");
    }, 150);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", placeSymbar);
    window.visualViewport.addEventListener("scroll", placeSymbar);
  }

  render();
  if (syncCfg().token) syncNow(false);
})();
