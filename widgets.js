// Живые графики с ползунками внутри уроков. Работают без Python, сразу.
// Математика совпадает с примерами уроков: при значениях по умолчанию
// виджеты показывают те же числа, что напечатаны в уроке.
(function () {
  "use strict";

  function r3(x) { return Number(x.toFixed(3)).toString(); }
  function pct(x) { return Math.round(x * 100) + " %"; }
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }
  function softmax(z) {
    var m = Math.max.apply(null, z);
    var e = z.map(function (v) { return Math.exp(v - m); });
    var s = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (v) { return v / s; });
  }

  // Холст 320 × 200 с отступами под оси
  var W = 320, H = 200, PAD = 28;
  function scaler(x0, x1, y0, y1) {
    return {
      x: function (x) { return PAD + (x - x0) / (x1 - x0) * (W - PAD - 8); },
      y: function (y) { return H - PAD - (y - y0) / (y1 - y0) * (H - PAD - 8); }
    };
  }
  function svg(inner, label) {
    return '<svg class="w-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + label + '">' + inner + '</svg>';
  }
  function axes(s, x0, x1, y0, y1, xl, yl) {
    var h = '<line class="w-axis" x1="' + s.x(x0) + '" y1="' + s.y(y0) + '" x2="' + s.x(x1) + '" y2="' + s.y(y0) + '"/>';
    h += '<line class="w-axis" x1="' + s.x(x0) + '" y1="' + s.y(y0) + '" x2="' + s.x(x0) + '" y2="' + s.y(y1) + '"/>';
    h += '<text class="w-text" x="' + (W - 8) + '" y="' + (H - 8) + '" text-anchor="end">' + xl + '</text>';
    h += '<text class="w-text" x="4" y="14">' + yl + '</text>';
    return h;
  }
  function curve(s, f, x0, x1, ymin, ymax) {
    var pts = [];
    for (var i = 0; i <= 120; i++) {
      var x = x0 + (x1 - x0) * i / 120;
      var y = Math.max(ymin, Math.min(ymax, f(x)));
      pts.push(s.x(x).toFixed(1) + "," + s.y(y).toFixed(1));
    }
    return '<polyline class="w-curve" points="' + pts.join(" ") + '"/>';
  }

  var DEFS = {
    // Проект 2, урок 5: спуск по потерям (w − 3)²
    gd: {
      title: "Покрути сам: градиентный спуск",
      controls: [
        { key: "lr", label: "Скорость обучения", min: 0.01, max: 1.2, step: 0.01, value: 0.1 },
        { key: "start", label: "Начальный вес", min: -2, max: 8, step: 0.5, value: 0 },
        { key: "steps", label: "Число шагов", min: 1, max: 50, step: 1, value: 10 }
      ],
      compute: function (v) {
        var w = v.start, path = [w];
        for (var i = 0; i < v.steps; i++) {
          w = w - v.lr * 2 * (w - 3);
          path.push(w);
        }
        return path;
      },
      draw: function (v) {
        var path = this.compute(v);
        var s = scaler(-3, 9, 0, 40);
        var g = axes(s, -3, 9, 0, 40, "вес w", "потери");
        g += curve(s, function (w) { return (w - 3) * (w - 3); }, -3, 9, 0, 40);
        var pts = path.map(function (w) {
          var cw = Math.max(-3, Math.min(9, w));
          return [s.x(cw), s.y(Math.min(40, (w - 3) * (w - 3)))];
        });
        g += '<polyline class="w-path" points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '"/>';
        pts.forEach(function (p, i) {
          g += '<circle class="' + (i === pts.length - 1 ? "w-dot-last" : "w-dot") + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === pts.length - 1 ? 5 : 3) + '"/>';
        });
        var last = path[path.length - 1];
        var msg = "После " + v.steps + " шагов: w = " + r3(last) + ", потери = " + r3((last - 3) * (last - 3)) + ".";
        if (Math.abs(last - 3) > Math.abs(v.start - 3) + 1e-9) msg += " Шаг слишком большой: вес перепрыгивает минимум и улетает всё дальше.";
        else if (Math.abs(last - 3) < 0.01) msg += " Вес почти на дне, в точке 3.";
        else msg += " Вес движется к дну в точке 3.";
        return { svg: svg(g, "График потерь и шагов градиентного спуска"), text: msg };
      }
    },

    // Проект 2, урок 4: сигмоида от w·x + b
    sigmoid: {
      title: "Покрути сам: вес и смещение нейрона",
      controls: [
        { key: "w", label: "Вес w", min: -3, max: 3, step: 0.1, value: 0.5 },
        { key: "b", label: "Смещение b", min: -5, max: 5, step: 0.5, value: 0 }
      ],
      draw: function (v) {
        var s = scaler(-6, 6, 0, 1);
        var g = axes(s, -6, 6, 0, 1, "x", "вероятность");
        g += '<line class="w-grid" x1="' + s.x(-6) + '" y1="' + s.y(0.5) + '" x2="' + s.x(6) + '" y2="' + s.y(0.5) + '"/>';
        g += curve(s, function (x) { return sigmoid(v.w * x + v.b); }, -6, 6, 0, 1);
        var p = sigmoid(v.w * 2 + v.b);
        g += '<circle class="w-dot-last" cx="' + s.x(2) + '" cy="' + s.y(p) + '" r="5"/>';
        var msg = "При x = 2: z = " + r3(v.w) + " · 2 + " + r3(v.b) + " = " + r3(v.w * 2 + v.b) +
          ", вероятность = " + r3(p) + ". Вес меняет крутизну и направление кривой, смещение сдвигает её влево и вправо.";
        return { svg: svg(g, "Кривая сигмоиды"), text: msg };
      }
    },

    // Проект 2, урок 6: порог и precision / recall
    threshold: {
      title: "Покрути сам: порог решения",
      controls: [
        { key: "t", label: "Порог: с какой вероятности отвечать «Дикинсон»", min: 0.05, max: 0.95, step: 0.05, value: 0.5 }
      ],
      items: [
        [0.9, "D"], [0.8, "D"], [0.7, "D"], [0.4, "D"],
        [0.6, "W"], [0.3, "W"], [0.2, "W"], [0.15, "W"], [0.1, "W"], [0.05, "W"]
      ],
      compute: function (v) {
        var c = { TP: 0, FP: 0, FN: 0, TN: 0 };
        this.items.forEach(function (it) {
          var pred = it[0] >= v.t ? "D" : "W";
          if (pred === "D" && it[1] === "D") c.TP++;
          else if (pred === "D") c.FP++;
          else if (it[1] === "D") c.FN++;
          else c.TN++;
        });
        c.precision = c.TP + c.FP ? c.TP / (c.TP + c.FP) : 0;
        c.recall = c.TP / (c.TP + c.FN);
        return c;
      },
      draw: function (v) {
        var c = this.compute(v);
        var s = scaler(0, 1, 0, 1);
        var g = '<line class="w-axis" x1="' + s.x(0) + '" y1="100" x2="' + s.x(1) + '" y2="100"/>';
        g += '<text class="w-text" x="' + (W - 8) + '" y="' + (H - 8) + '" text-anchor="end">вероятность «Дикинсон» по мнению модели</text>';
        this.items.forEach(function (it, i) {
          var y = it[1] === "D" ? 70 : 130;
          g += '<circle class="' + (it[1] === "D" ? "w-d" : "w-w") + '" cx="' + s.x(it[0]).toFixed(1) + '" cy="' + y + '" r="7"/>';
        });
        g += '<text class="w-text" x="6" y="74">D</text><text class="w-text" x="6" y="134">W</text>';
        g += '<line class="w-thr" x1="' + s.x(v.t) + '" y1="40" x2="' + s.x(v.t) + '" y2="160"/>';
        var table = '<table class="w-table"><tr><th></th><th>сказала D</th><th>сказала W</th></tr>' +
          '<tr><th>на самом деле D</th><td>TP ' + c.TP + '</td><td>FN ' + c.FN + '</td></tr>' +
          '<tr><th>на самом деле W</th><td>FP ' + c.FP + '</td><td>TN ' + c.TN + '</td></tr></table>';
        var msg = "Precision = " + r3(c.precision) + ", recall = " + r3(c.recall) +
          ". Сдвинь порог вправо: модель станет осторожнее, precision вырастет, а recall упадёт.";
        return { svg: svg(g, "Стихи на шкале вероятности и порог") + table, text: msg };
      }
    },

    // Проект 5, урок 4: температура
    temperature: {
      title: "Покрути сам: температура",
      controls: [
        { key: "T", label: "Температура", min: 0.1, max: 3, step: 0.1, value: 1 }
      ],
      words: ["sea", "sky", "stone"],
      logits: [2.0, 1.0, 0.1],
      draw: function (v) {
        var p = softmax(this.logits.map(function (z) { return z / v.T; }));
        var g = '';
        var bw = 70, gap = 25, x0 = 45;
        p.forEach(function (pi, i) {
          var hgt = pi * 140;
          var x = x0 + i * (bw + gap);
          g += '<rect class="w-bar" x="' + x + '" y="' + (165 - hgt).toFixed(1) + '" width="' + bw + '" height="' + hgt.toFixed(1) + '"/>';
          g += '<text class="w-text" x="' + (x + bw / 2) + '" y="' + (158 - hgt).toFixed(1) + '" text-anchor="middle">' + r3(pi) + '</text>';
          g += '<text class="w-text" x="' + (x + bw / 2) + '" y="185" text-anchor="middle">' + this.words[i] + '</text>';
        }, this);
        var msg = "Вероятности: " + this.words.map(function (w, i) { return w + " " + pct(p[i]); }).join(", ") +
          ". Низкая температура отдаёт почти всё лучшему слову, высокая выравнивает шансы.";
        return { svg: svg(g, "Вероятности трёх слов при выбранной температуре"), text: msg };
      }
    }
  };

  window.Widgets = {
    defs: DEFS,
    defaults: function (name) {
      var v = {};
      DEFS[name].controls.forEach(function (c) { v[c.key] = c.value; });
      return v;
    },
    draw: function (name, values) { return DEFS[name].draw(values); }
  };
})();
