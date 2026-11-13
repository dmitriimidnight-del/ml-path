"""Builds exercises.js: "find the bug" and "put the code in order" tasks.

Everything shown to the learner is computed here by running the code:
- for a bug task: what the fixed code prints, what the buggy code prints, and that
  the two versions differ in exactly one line, the one marked as the bug;
- for an ordering task: what the program prints and EVERY order of lines that
  prints the same thing without an error (so the app accepts all correct orders).

Usage: python tools/build_exercises.py
"""
import contextlib
import io
import itertools
import json
import os
import warnings

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
warnings.filterwarnings("ignore")

EXERCISES = {
    "p1.t1": {
        "bug": {
            "task": "Программа должна посчитать слова в строке, где между словами случайно два пробела.",
            "code": 'text = "The sea  is deep"\nwords = text.lower().split(" ")\nprint(len(words))',
            "fixed": 'text = "The sea  is deep"\nwords = text.lower().split()\nprint(len(words))',
            "why": "split(\" \") режет строго по одному пробелу, и между двумя пробелами появляется пустая строка. split() без аргументов режет по любому количеству пробелов."
        },
        "order": {
            "task": "Собери программу, которая находит самое частое слово.",
            "code": 'from collections import Counter\ntext = "the sea and the sky"\nwords = text.split()\ncounts = Counter(words)\nprint(counts.most_common(1))'
        }
    },
    "p1.t4": {
        "bug": {
            "task": "Программа должна посчитать число строк в каждом стихотворении.",
            "code": 'import pandas as pd\ndf = pd.DataFrame({"text": ["a\\nb", "c\\nd\\ne"]})\ndf["n_lines"] = df["text"].str.count("\\n")\nprint(df["n_lines"].tolist())',
            "fixed": 'import pandas as pd\ndf = pd.DataFrame({"text": ["a\\nb", "c\\nd\\ne"]})\ndf["n_lines"] = df["text"].str.count("\\n") + 1\nprint(df["n_lines"].tolist())',
            "why": "Переносов строки всегда на один меньше, чем строк. Без «+ 1» каждое стихотворение получается на строку короче."
        },
        "order": {
            "task": "Собери программу, которая считает среднее по каждому автору.",
            "code": 'import pandas as pd\ndf = pd.DataFrame({"author": ["A", "A", "B"], "n": [2, 4, 5]})\nmeans = df.groupby("author")["n"].mean()\nprint(means["A"], means["B"])'
        }
    },
    "p1.t5": {
        "bug": {
            "task": "Функция должна считать разные слова среди первых n слов текста.",
            "code": 'def vocabulary(words, n=3):\n    return len(set(words[n:]))\n\nprint(vocabulary(["a", "b", "a", "c", "d", "e"]))',
            "fixed": 'def vocabulary(words, n=3):\n    return len(set(words[:n]))\n\nprint(vocabulary(["a", "b", "a", "c", "d", "e"]))',
            "why": "words[:n] — первые n элементов, а words[n:] — всё начиная с номера n. Двоеточие стоит не с той стороны."
        }
    },
    "p2.t3": {
        "bug": {
            "task": "Векторизатор должен построить словарь по обучающим текстам и записать тестовые тексты в том же словаре.",
            "code": 'from sklearn.feature_extraction.text import TfidfVectorizer\ntrain = ["cold sea", "red rose"]\ntest = ["green sea"]\nvec = TfidfVectorizer()\nX_train = vec.fit_transform(train)\nX_test = vec.fit_transform(test)\nprint(X_train.shape[1] == X_test.shape[1])',
            "fixed": 'from sklearn.feature_extraction.text import TfidfVectorizer\ntrain = ["cold sea", "red rose"]\ntest = ["green sea"]\nvec = TfidfVectorizer()\nX_train = vec.fit_transform(train)\nX_test = vec.transform(test)\nprint(X_train.shape[1] == X_test.shape[1])',
            "why": "fit_transform на тесте строит новый словарь по тестовым текстам. Это утечка, и размеры матриц перестают совпадать. На тесте нужен только transform."
        },
        "order": {
            "task": "Собери программу, которая считает качество базовой модели.",
            "code": 'from sklearn.dummy import DummyClassifier\nX = [[0], [1], [2], [3]]\ny = ["A", "A", "A", "B"]\nmodel = DummyClassifier(strategy="most_frequent")\nmodel.fit(X, y)\nprint(model.score(X, y))'
        }
    },
    "p2.t4": {
        "bug": {
            "task": "Функция должна превращать число в вероятность сигмоидой.",
            "code": 'import numpy as np\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(z))\n\nprint(round(sigmoid(2.0), 3))',
            "fixed": 'import numpy as np\n\ndef sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\nprint(round(sigmoid(2.0), 3))',
            "why": "В сигмоиде стоит e в степени минус z. Без минуса кривая переворачивается: большие числа превращаются в вероятность около нуля."
        },
        "order": {
            "task": "Собери программу, которая считает взвешенную сумму со смещением.",
            "code": 'import numpy as np\nw = np.array([2.0, -1.0])\nx = np.array([1, 3])\nz = np.dot(w, x) + 0.5\nprint(z)'
        }
    },
    "p2.t5": {
        "bug": {
            "task": "Градиентный спуск должен найти минимум функции (w − 3)².",
            "code": 'def slope(w):\n    return 2 * (w - 3)\n\nw = 0.0\nfor step in range(50):\n    w = w + 0.1 * slope(w)\nprint(round(w, 2))',
            "fixed": 'def slope(w):\n    return 2 * (w - 3)\n\nw = 0.0\nfor step in range(50):\n    w = w - 0.1 * slope(w)\nprint(round(w, 2))',
            "why": "Шаг делают против наклона: из веса вычитают. С плюсом вес идёт вверх по склону и улетает всё дальше от минимума."
        },
        "order": {
            "task": "Собери программу, которая делает три шага градиентного спуска.",
            "code": 'def slope(w):\n    return 2 * (w - 3)\nw = 0.0\nfor step in range(3):\n    w = w - 0.1 * slope(w)\nprint(round(w, 3))'
        }
    },
    "p2.t6": {
        "bug": {
            "task": "Программа должна посчитать precision и recall.",
            "code": 'TP, FP, FN = 8, 2, 8\nprecision = TP / (TP + FN)\nrecall = TP / (TP + FN)\nprint(precision, recall)',
            "fixed": 'TP, FP, FN = 8, 2, 8\nprecision = TP / (TP + FP)\nrecall = TP / (TP + FN)\nprint(precision, recall)',
            "why": "Precision — доля верных среди всех, кого модель назвала: TP / (TP + FP). В знаменателе по ошибке стоят пропуски FN, как у recall."
        },
        "order": {
            "task": "Собери программу, которая считает долю правильных ответов.",
            "code": 'y_true = ["D", "D", "W", "W"]\ny_pred = ["D", "W", "W", "W"]\ncorrect = sum(t == p for t, p in zip(y_true, y_pred))\nprint(correct / len(y_true))'
        }
    },
    "p3.t1": {
        "bug": {
            "task": "Функция должна возвращать число слов в тексте.",
            "code": 'def count_words(text):\n    len(text.split())\n\nprint(count_words("cold sea"))',
            "fixed": 'def count_words(text):\n    return len(text.split())\n\nprint(count_words("cold sea"))',
            "why": "Функция считает число, но не возвращает его: нет return. Функция без return возвращает None."
        },
        "order": {
            "task": "Собери программу с функцией, у которой есть значение по умолчанию.",
            "code": 'def greet(name, punctuation="!"):\n    return "Hello, " + name + punctuation\nprint(greet("Keats"))'
        }
    },
    "p4.t3": {
        "bug": {
            "task": "Функция df должна возвращать производную f(x) = (3x + 1)² по правилу цепочки.",
            "code": 'def f(x):\n    return (3 * x + 1) ** 2\n\ndef df(x):\n    return 2 * (3 * x + 1)\n\nprint(df(2))',
            "fixed": 'def f(x):\n    return (3 * x + 1) ** 2\n\ndef df(x):\n    return 2 * (3 * x + 1) * 3\n\nprint(df(2))',
            "why": "По правилу цепочки производную внешней функции нужно умножить на производную внутренней. Производная 3x + 1 равна 3, и этот множитель забыт."
        },
        "order": {
            "task": "Собери программу, которая проверяет производную численно.",
            "code": 'def f(x):\n    return x ** 2\nh = 1e-5\nx = 3.0\nprint(round((f(x + h) - f(x - h)) / (2 * h), 3))'
        }
    },
    "p5.t2": {
        "bug": {
            "task": "Программа должна разрезать пять строк на куски по две строки.",
            "code": 'text = "a\\nb\\nc\\nd\\ne"\nlines = text.split("\\n")\nchunks = [lines[i:i + 2] for i in range(0, len(lines), 1)]\nprint(len(chunks))',
            "fixed": 'text = "a\\nb\\nc\\nd\\ne"\nlines = text.split("\\n")\nchunks = [lines[i:i + 2] for i in range(0, len(lines), 2)]\nprint(len(chunks))',
            "why": "Третий аргумент range — шаг. С шагом 1 куски начинаются с каждой строки и перекрываются. Шаг должен совпадать с размером куска."
        },
        "order": {
            "task": "Собери программу, которая находит номера двух лучших результатов поиска.",
            "code": 'import numpy as np\nscores = np.array([0.2, 0.9, 0.5])\nbest = np.argsort(-scores)[:2]\nprint(best.tolist())'
        }
    }
}


def run(code):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, "<ex>", "exec"), {"__name__": "__main__"})
        return buf.getvalue().strip(), None
    except Exception as e:  # noqa: BLE001
        return None, type(e).__name__


out = {}
for key, ex in EXERCISES.items():
    item = {}
    if "bug" in ex:
        b = ex["bug"]
        good, err = run(b["fixed"])
        assert err is None, (key, "fixed code fails", err)
        bad, bad_err = run(b["code"])
        assert bad != good, (key, "buggy code prints the same")
        lines, fixed_lines = b["code"].split("\n"), b["fixed"].split("\n")
        assert len(lines) == len(fixed_lines), key
        diff = [i for i, (a, c) in enumerate(zip(lines, fixed_lines)) if a != c]
        assert len(diff) == 1, (key, "must differ in exactly one line", diff)
        item["bug"] = {
            "task": b["task"], "lines": lines, "bugLine": diff[0], "fixedLine": fixed_lines[diff[0]],
            "expected": good, "actual": bad if bad_err is None else "Ошибка " + bad_err, "why": b["why"],
        }
    if "order" in ex:
        o = ex["order"]
        lines = [l for l in o["code"].split("\n") if l.strip()]
        expected, err = run("\n".join(lines))
        assert err is None, (key, "order code fails", err)
        valid = []
        for perm in itertools.permutations(range(len(lines))):
            res, e = run("\n".join(lines[i] for i in perm))
            if e is None and res == expected:
                valid.append(list(perm))
        assert list(range(len(lines))) in valid, key
        item["order"] = {"task": o["task"], "lines": lines, "expected": expected, "valid": valid}
    out[key] = item
    print("%-6s bug: %-28s order: %s" % (
        key,
        "%r -> %r" % (item["bug"]["actual"], item["bug"]["expected"]) if "bug" in item else "-",
        "%d строк, верных порядков %d" % (len(item["order"]["lines"]), len(item["order"]["valid"])) if "order" in item else "-",
    ))

with open(os.path.join(ROOT, "exercises.js"), "w", encoding="utf-8") as f:
    f.write("// Сгенерировано tools/build_exercises.py — не править вручную.\n")
    f.write("// Все выводы получены запуском кода; valid — все порядки строк, которые дают нужный вывод.\n")
    f.write("window.EXERCISES = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
print("Записано заданий:", sum(len(v) for v in out.values()))
