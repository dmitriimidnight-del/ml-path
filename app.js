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
  var tab = "brief";

  // ---------- утилиты ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function project(id) {
    for (var i = 0; i < PATH.projects.length; i++) {
      if (PATH.projects[i].id === id) return PATH.projects[i];
    }
    return null;
  }

  function isDetailed(p) { return !!p.plan; }

  // Список всех отмечаемых пунктов проекта: [{key, group}]
  function items(p) {
    var out = [];
    if (!isDetailed(p)) return out;
    p.plan.forEach(function (w, wi) {
      w.tasks.forEach(function (_, ti) { out.push({ group: "tasks", key: p.id + ".w" + wi + ".t" + ti }); });
    });
    p.theory.forEach(function (t) {
      t.quiz.forEach(function (_, qi) { out.push({ group: "quiz", key: p.id + "." + t.id + ".q" + qi }); });
    });
    p.criteria.forEach(function (_, ci) { out.push({ group: "criteria", key: p.id + ".c" + ci }); });
    return out;
  }

  function quizCorrect(p, key) {
    var parts = key.split(".");
    var t = p.theory.filter(function (x) { return x.id === parts[1]; })[0];
    var q = t.quiz[Number(parts[2].slice(1))];
    return state.quiz[key] === q.answer;
  }

  function progress(p) {
    var all = items(p);
    if (!all.length) return { done: 0, total: 0, pct: 0 };
    var done = all.filter(function (it) {
      if (it.group === "quiz") return quizCorrect(p, it.key);
      return !!state[it.group][it.key];
    }).length;
    return { done: done, total: all.length, pct: Math.round((done / all.length) * 100) };
  }

  function nextTask() {
    for (var i = 0; i < PATH.projects.length; i++) {
      var p = PATH.projects[i];
      if (!isDetailed(p)) continue;
      for (var wi = 0; wi < p.plan.length; wi++) {
        for (var ti = 0; ti < p.plan[wi].tasks.length; ti++) {
          var key = p.id + ".w" + wi + ".t" + ti;
          if (!state.tasks[key]) return { p: p, week: p.plan[wi].title, text: p.plan[wi].tasks[ti] };
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
    var detailed = PATH.projects.filter(isDetailed);
    var done = 0, total = 0;
    detailed.forEach(function (p) { var pr = progress(p); done += pr.done; total += pr.total; });
    var finished = PATH.projects.filter(function (p) { return isDetailed(p) && progress(p).pct === 100; }).length;
    var next = nextTask();

    var h = '';
    h += '<header class="hero">';
    h += '<p class="eyebrow">' + finished + ' из ' + PATH.projects.length + ' проектов в портфолио</p>';
    h += '<h1>' + esc(PATH.title) + '</h1>';
    h += '<p class="lead">' + esc(PATH.subtitle) + '</p>';
    h += '</header>';

    if (next) {
      h += '<a class="next" href="#' + next.p.id + '/plan">';
      h += '<span class="next-label">Следующий шаг</span>';
      h += '<span class="next-text">' + esc(next.text) + '</span>';
      h += '<span class="next-meta">' + esc(next.p.title) + ' · ' + esc(next.week) + '</span>';
      h += '</a>';
    }

    h += '<ol class="ladder">';
    PATH.projects.forEach(function (p, i) {
      var pr = progress(p);
      h += '<li><a class="step" href="#' + p.id + '">';
      h += '<span class="num">' + (i + 1) + '</span>';
      h += '<span class="step-body">';
      h += '<span class="step-title">' + esc(p.title) + '</span>';
      h += '<span class="step-tag">' + esc(p.tagline) + '</span>';
      h += '<span class="step-meta">' + esc(p.weeks) + (isDetailed(p) ? ' · ' + pr.pct + '%' : '') + '</span>';
      if (isDetailed(p)) h += bar(pr.pct, 'Прогресс проекта ' + p.title);
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

  var TABS = [["brief", "Бриф"], ["theory", "Теория"], ["plan", "План"], ["ready", "Готовность"]];

  function viewProject(p) {
    var idx = PATH.projects.indexOf(p);
    var pr = progress(p);
    var h = '';
    h += '<a class="back" href="#">← Весь путь</a>';
    h += '<header class="phead">';
    h += '<p class="eyebrow">Проект ' + (idx + 1) + ' · ' + esc(p.weeks) + '</p>';
    h += '<h1>' + esc(p.title) + '</h1>';
    h += '<p class="lead">' + esc(p.tagline) + '</p>';
    h += '<ul class="chips">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (isDetailed(p)) h += bar(pr.pct, 'Прогресс проекта') + '<p class="hint">' + pr.done + ' из ' + pr.total + ' пунктов</p>';
    h += '</header>';

    if (isDetailed(p)) {
      h += '<nav class="tabs" role="tablist">';
      TABS.forEach(function (t) {
        h += '<a role="tab" aria-selected="' + (tab === t[0]) + '" href="#' + p.id + '/' + t[0] + '">' + t[1] + '</a>';
      });
      h += '</nav>';
    }

    var current = isDetailed(p) ? tab : "brief";
    if (current === "brief") h += briefHtml(p, idx);
    if (current === "theory") h += theoryHtml(p);
    if (current === "plan") h += planHtml(p);
    if (current === "ready") h += readyHtml(p);

    app.innerHTML = h;
  }

  function briefHtml(p, idx) {
    var b = p.brief, h = '<section class="panel">';
    h += '<h2>Задача</h2><p>' + esc(b.goal) + '</p>';
    if (b.questions) {
      h += '<h2>Вопросы, на которые отвечаешь</h2><ul class="plain">' +
        b.questions.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ul>';
    }
    h += '<h2>Что должно получиться</h2><ul class="plain">' +
      b.result.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>';
    if (b.data) h += '<h2>Данные</h2><p>' + esc(b.data) + '</p>';
    if (!isDetailed(p)) {
      h += '<p class="note">Теория, недельный план и критерии готовности появятся здесь, когда будет закончен проект ' + idx + '.</p>';
    }
    return h + '</section>';
  }

  function theoryHtml(p) {
    var h = '';
    p.theory.forEach(function (t) {
      var correct = t.quiz.filter(function (_, qi) { return quizCorrect(p, p.id + "." + t.id + ".q" + qi); }).length;
      h += '<section class="panel"><h2>' + esc(t.title) + '</h2>';
      h += '<ul class="plain">' + t.points.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      h += '<pre><code>' + esc(t.code) + '</code></pre>';
      h += '<div class="quiz-head"><h3>Проверь себя</h3><span class="hint">' + correct + ' из ' + t.quiz.length + '</span></div>';
      t.quiz.forEach(function (q, qi) {
        var key = p.id + "." + t.id + ".q" + qi;
        var picked = state.quiz[key];
        var answered = picked !== undefined;
        h += '<fieldset class="q"><legend>' + esc(q.q) + '</legend>';
        // порядок вариантов постоянный для вопроса, но правильный не всегда первый
        order(q.options.length, qi + t.id.length).forEach(function (oi) {
          var cls = "opt";
          if (answered && oi === q.answer) cls += " right";
          else if (answered && oi === picked) cls += " wrong";
          h += '<button type="button" class="' + cls + '" data-act="answer" data-key="' + key + '" data-i="' + oi + '"' +
            (answered ? ' disabled' : '') + '>' + esc(q.options[oi]) + '</button>';
        });
        if (answered) {
          h += '<p class="why"><strong>' + (picked === q.answer ? 'Верно.' : 'Неверно.') + '</strong> ' + esc(q.why) + '</p>';
        }
        h += '</fieldset>';
      });
      h += '<button type="button" class="ghost" data-act="reset-quiz" data-prefix="' + p.id + "." + t.id + '.">Пройти заново</button>';
      h += '</section>';
    });
    return h;
  }

  // Детерминированная перестановка индексов 0..n-1
  function order(n, seed) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    var shift = (seed * 7 + 3) % n;
    a = a.slice(shift).concat(a.slice(0, shift));
    if (seed % 2) a.reverse();
    return a;
  }

  function checkbox(group, key, text) {
    var on = !!state[group][key];
    return '<label class="check' + (on ? ' on' : '') + '"><input type="checkbox" data-group="' + group +
      '" data-key="' + key + '"' + (on ? ' checked' : '') + '><span>' + esc(text) + '</span></label>';
  }

  function planHtml(p) {
    var h = '';
    p.plan.forEach(function (w, wi) {
      var done = w.tasks.filter(function (_, ti) { return state.tasks[p.id + ".w" + wi + ".t" + ti]; }).length;
      h += '<section class="panel"><div class="quiz-head"><h2>' + esc(w.title) + '</h2><span class="hint">' +
        done + ' из ' + w.tasks.length + '</span></div>';
      w.tasks.forEach(function (t, ti) { h += checkbox("tasks", p.id + ".w" + wi + ".t" + ti, t); });
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

  function render() {
    var parts = location.hash.replace(/^#/, "").split("/");
    var p = project(parts[0]);
    if (p) {
      tab = parts[1] && TABS.some(function (t) { return t[0] === parts[1]; }) ? parts[1] : "brief";
      viewProject(p);
    } else {
      viewHome();
    }
  }

  var lastHash = null;
  window.addEventListener("hashchange", function () {
    var samePage = lastHash !== null && lastHash.split("/")[0] === location.hash.split("/")[0];
    lastHash = location.hash;
    render();
    if (!samePage) window.scrollTo(0, 0);
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

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.dataset.act;

    if (act === "answer") {
      state.quiz[el.dataset.key] = Number(el.dataset.i);
      save();
      render();
    }
    if (act === "reset-quiz") {
      Object.keys(state.quiz).forEach(function (k) {
        if (k.indexOf(el.dataset.prefix) === 0) delete state.quiz[k];
      });
      save();
      render();
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

  lastHash = location.hash;
  render();
})();
