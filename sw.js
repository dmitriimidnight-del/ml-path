// Сервис-воркер: делает приложение доступным без интернета.
// Файлы приложения: сначала сеть (чтобы приходили обновления), без сети — из памяти телефона.
// Python (Pyodide с CDN): сначала память, потому что файлы конкретной версии не меняются.

var SHELL_CACHE = "mlpath-shell-v8";
var PYODIDE_CACHE = "mlpath-pyodide";
var NETWORK_TIMEOUT_MS = 4000;

var SHELL_FILES = [
  "./",
  "index.html",
  "styles.css",
  "data.js",
  "lessons-p1-extra.js",
  "lessons-p2.js",
  "lessons-p3.js",
  "lessons-p4.js",
  "lessons-p5.js",
  "lessons-p6.js",
  "checks.js",
  "english.js",
  "diagnostic.js",
  "exercises.js",
  "interview.js",
  "python-trainer.js",
  "widgets.js",
  "runner.js",
  "runner.py",
  "app.js",
  "manifest.webmanifest",
  "icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function (cache) { return cache.addAll(SHELL_FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        if (name.indexOf("mlpath-shell-") === 0 && name !== SHELL_CACHE) return caches.delete(name);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isPyodide(url) {
  return url.hostname === "cdn.jsdelivr.net" && url.pathname.indexOf("/pyodide/") === 0;
}

// Сначала память: для неизменяемых файлов Python
function cacheFirst(request) {
  return caches.open(PYODIDE_CACHE).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (response) {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
    });
  });
}

// Сначала сеть с ограничением по времени, без сети — память
function networkFirst(request) {
  return caches.open(SHELL_CACHE).then(function (cache) {
    var fromNetwork = fetch(request).then(function (response) {
      if (response.ok) cache.put(request, response.clone());
      return response;
    });
    var timeout = new Promise(function (resolve) {
      setTimeout(function () { resolve(null); }, NETWORK_TIMEOUT_MS);
    });
    return Promise.race([fromNetwork.catch(function () { return null; }), timeout]).then(function (response) {
      if (response) return response;
      return cache.match(request, { ignoreSearch: true }).then(function (hit) {
        return hit || fromNetwork;
      });
    });
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (isPyodide(url)) {
    event.respondWith(cacheFirst(request));
  } else if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  }
});
