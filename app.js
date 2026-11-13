(function () {
  "use strict";

  var PATH = window.PATH;
  var KEY = "mlpath.v1";
  var app = document.getElementById("app");
  var memory = null; // запасное хранилище, если localStorage недоступен

  // ---------- состояние ----------

  function emptyState() {
    return { tasks: {}, criteria: {}, quiz: {}, repo: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) { /* хранилище недоступно */ }
    return memory || emptyState();
  }

  function save() {
    memory = state;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* остаёмся в памяти */ }
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

    if (next) {
      h += '<a class="next" href="' + next.href + '">';
      h += '<span class="next-label">Следующий шаг</span>';
      h += '<span class="next-text">' + esc(next.text) + '</span>';
      h += '<span class="next-meta">' + esc(next.meta) + '</span>';
      h += '</a>';
    }

    h += '<ol class="ladder">';
    PATH.projects.forEach(function (p) {
      var pr = progress(p);
      var tracked = pr.total > 0;
      h += '<li><a class="step" href="#' + p.id + '">';
      h += '<span class="num' + (isIntro(p) ? ' num-start' : '') + '">' + (isIntro(p) ? '0' : projectNumber(p)) + '</span>';
      h += '<span class="step-body">';
      h += '<span class="step-title">' + esc(p.title) + '</span>';
      h += '<span class="step-tag">' + esc(p.tagline) + '</span>';
      h += '<span class="step-meta">' + esc(p.weeks) + (tracked ? ' · ' + pr.pct + '%' : '') + '</span>';
      if (tracked) h += bar(pr.pct, 'Прогресс: ' + p.title);
      h += '</span></a></li>';
    });
    h += '</ol>';

    h += '<details class="sync"><summary>Перенести прогресс на другое устройство</summary>';
    h += '<p>Прогресс хранится в браузере на этом устройстве. Чтобы продолжить на другом, скопируй код здесь и вставь его там.</p>';
    h += '<textarea id="sync-box" rows="3" spellcheck="false" aria-label="Код прогресса"></textarea>';
    h += '<div class="row"><button type="button" data-act="export">Показать мой код</button>';
    h += '<button type="button" data-act="import">Загрузить из кода</button></div>';
    h += '<p id="sync-msg" class="hint" role="status"></p>';
    h += '</details>';

    app.innerHTML = h;
  }

  // ---------- проект ----------

  var TABS = [["brief", "Бриф"], ["theory", "Уроки"], ["plan", "План"], ["ready", "Готовность"]];

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
      h += '<span class="step-meta">' + esc(t.time) + ' · квиз ' + s.right + ' из ' + s.total + '</span></span>';
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
      if (r.error.hint) h += '<p>' + esc(r.error.hint) + '</p>';
      h += '<button type="button" class="ghost small" data-act="reset-space">Начать заново</button></div>';
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
        '<p>При первом запуске нужен интернет. Проверь соединение и нажми «Запустить» ещё раз.</p></div>');
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
    var m = runMem[box.dataset.id] = runMem[box.dataset.id] || {};
    m.code = ta.value;
    ta.rows = rows(ta.value);
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

  function viewLesson(p, t) {
    var idx = p.theory.indexOf(t);
    var backHref = '#' + p.id + (isIntro(p) ? '' : '/theory');
    var h = '';
    h += '<a class="back" href="' + backHref + '">← ' + (isIntro(p) ? esc(p.title) : 'Уроки проекта') + '</a>';
    h += '<header class="phead">';
    h += '<p class="eyebrow">Урок ' + (idx + 1) + ' из ' + p.theory.length + ' · ' + esc(t.time) + '</p>';
    h += '<h1>' + esc(t.title) + '</h1>';
    h += '</header>';

    h += '<section class="panel why-box"><h2>Зачем это нужно</h2><p>' + fmt(t.why) + '</p></section>';

    t.sections.forEach(function (s, si) {
      h += '<section class="panel"><h2>' + esc(s.h) + '</h2>';
      s.p.forEach(function (x) { h += '<p>' + fmt(x) + '</p>'; });
      if (s.code) h += sectionRunnable(s) ? runBox(p, t, 's' + si, s.code) : codeBlock(s.code);
      if (s.out) h += codeBlock(s.out, 'Что напечатает программа');
      if (s.note) h += '<p class="note">' + fmt(s.note) + '</p>';
      h += '</section>';
    });

    if (t.mistakes) {
      h += '<section class="panel"><h2>Частые ошибки</h2><ul class="mistakes">';
      t.mistakes.forEach(function (m) {
        h += '<li><p class="bad">' + fmt(m.bad) + '</p><p class="fix">' + fmt(m.fix) + '</p></li>';
      });
      h += '</ul></section>';
    }

    if (t.practice) {
      h += '<section class="panel"><h2>Попробуй сам</h2>';
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
      t.terms.forEach(function (x) { h += '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; });
      h += '</dl></section>';
    }

    h += quizHtml(p, t);

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
    var h = '<section class="panel" id="quiz"><div class="quiz-head"><h2>Проверь себя</h2><span class="hint">' +
      s.right + ' из ' + s.total + '</span></div>';
    t.quiz.forEach(function (q, qi) {
      var key = qKey(p, t, qi);
      var picked = state.quiz[key];
      var answered = picked !== undefined;
      h += '<fieldset class="q"><legend>' + fmt(q.q) + '</legend>';
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
      h += '</fieldset>';
    });
    h += '<button type="button" class="ghost" data-act="reset-quiz" data-prefix="' + p.id + "." + t.id + '.">Пройти заново</button>';
    return h + '</section>';
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
    }
    h += '</section>';
    return h;
  }

  // ---------- маршрутизация и события ----------

  function parts() { return location.hash.replace(/^#/, "").split("/"); }

  function render() {
    var a = parts();
    var p = project(a[0]);
    if (!p) { viewHome(); return; }
    if (a[1] === "theory" && a[2] && hasLessons(p)) {
      var t = p.theory.filter(function (x) { return x.id === a[2]; })[0];
      if (t) { viewLesson(p, t); return; }
    }
    var tab = TABS.some(function (t) { return t[0] === a[1]; }) ? a[1] : "brief";
    viewProject(p, tab);
  }

  // Страница = проект + урок. Переключение вкладок внутри проекта не прокручивает наверх.
  function pageKey() { var a = parts(); return a[0] + "|" + (a[2] || ""); }

  var lastPage = pageKey();
  window.addEventListener("hashchange", function () {
    var now = pageKey();
    render();
    if (now !== lastPage) window.scrollTo(0, 0);
    lastPage = now;
  });

  app.addEventListener("change", function (e) {
    var el = e.target;
    if (el.type === "checkbox" && el.dataset.key) {
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

    if (act === "answer") {
      state.quiz[el.dataset.key] = Number(el.dataset.i);
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

  render();
})();
