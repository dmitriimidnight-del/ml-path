// Загрузка Python (Pyodide) в браузер и выполнение кода из уроков.
// Python скачивается только при первом нажатии «Запустить».
(function () {
  "use strict";

  // Если первая версия не загрузится, пробуем следующую.
  var VERSIONS = ["v0.28.0", "v0.27.7"];
  var CDN = "https://cdn.jsdelivr.net/pyodide/";

  var py = null;
  var booting = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { s.remove(); reject(new Error("Не загрузился " + src)); };
      document.head.appendChild(s);
    });
  }

  async function boot(status) {
    var lastError = null;
    for (var i = 0; i < VERSIONS.length; i++) {
      var base = CDN + VERSIONS[i] + "/full/";
      try {
        status("Загружаю Python: около 10 МБ, только в первый раз…");
        await loadScript(base + "pyodide.js");
        var instance = await window.loadPyodide({ indexURL: base });
        status("Запускаю Python…");
        var helper = await (await fetch("runner.py", { cache: "no-cache" })).text();
        await instance.runPythonAsync(helper);
        return instance;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error("Python не загрузился");
  }

  function ensure(status) {
    if (py) return Promise.resolve(py);
    if (!booting) {
      booting = boot(status).then(
        function (instance) { py = instance; return py; },
        function (e) { booting = null; throw e; }
      );
    }
    return booting;
  }

  async function run(code, key, status) {
    var instance = await ensure(status);
    await instance.loadPackagesFromImports(code, {
      messageCallback: function () { status("Загружаю библиотеки, это бывает долго только в первый раз…"); }
    });
    instance.globals.set("_lesson_code", code);
    instance.globals.set("_lesson_key", key);
    var json = await instance.runPythonAsync("lesson_run(_lesson_code, _lesson_key)");
    return JSON.parse(json);
  }

  async function reset(key) {
    if (!py) return;
    py.globals.set("_lesson_key", key);
    await py.runPythonAsync("lesson_reset(_lesson_key)");
  }

  window.Runner = { run: run, reset: reset, isReady: function () { return !!py; } };
})();
