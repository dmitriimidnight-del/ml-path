// Создано tools/build_trainer.py: каждая задача проверена запуском в Python 3.13.
window.PYTRAINER = {
 "harness": "\nimport json as _json\n_res = []\nfor _call, _exp in _TESTS:\n    try:\n        _got = eval(_call)\n        try:\n            _ok = bool(_got == eval(_exp))   # np.bool_ -> bool; an array or Series raises -> not equal\n        except Exception:\n            _ok = False\n        _res.append([_call, repr(_got), _ok, _exp])\n    except Exception as _e:\n        _res.append([_call, type(_e).__name__ + \": \" + str(_e), False, _exp])\nprint(\"@@RESULTS@@\" + _json.dumps(_res, ensure_ascii=False))\n",
 "topics": [
  {
   "id": "basics",
   "title": "Числа и переменные",
   "diag": [
    "numbers"
   ],
   "intro": "Переменная — имя для значения. `/` всегда даёт дробное число, `//` — целую часть от деления, `%` — остаток. `int()` и `float()` превращают строку в число.",
   "tasks": [
    {
     "type": "predict",
     "code": "lines = 14\nstanzas = 3\nprint(lines // stanzas, lines % stanzas)",
     "why": "`//` — целая часть от деления, `%` — остаток: 14 = 3 · 4 + 2.",
     "id": "basics.1",
     "expected": "4 2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "lines",
          "14"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "lines",
          "14"
         ],
         [
          "stanzas",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "lines",
          "14"
         ],
         [
          "stanzas",
          "3"
         ]
        ],
        "out": "4 2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "x = 7 / 2\ny = int(x)\nprint(x, y, type(y).__name__)",
     "why": "`/` всегда даёт дробное число. `int()` отбрасывает дробную часть, а не округляет.",
     "id": "basics.2",
     "expected": "3.5 3 int",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "x",
          "3.5"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "x",
          "3.5"
         ],
         [
          "y",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "x",
          "3.5"
         ],
         [
          "y",
          "3"
         ]
        ],
        "out": "3.5 3 int\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Посчитать, сколько слов приходится на строку: 120 слов на 8 строк.",
     "why": "Число из файла или из `input()` часто приходит строкой. Строку нельзя делить: сначала `int()`.",
     "id": "basics.3",
     "fixedLine": "print(int(words) / lines)",
     "lines": [
      "words = \"120\"",
      "lines = 8",
      "print(words / lines)"
     ],
     "bugLine": 2,
     "expected": "15.0",
     "actual": "TypeError: unsupported operand type(s) for /: 'str' and 'int'",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Сколько полных строф по 4 строки получится из 18 строк?",
     "why": "`/` даёт дробь 4.5. Количество полных строф — целая часть от деления, `//`.",
     "id": "basics.4",
     "fixedLine": "full = lines // 4",
     "lines": [
      "lines = 18",
      "full = lines / 4",
      "print(full)"
     ],
     "bugLine": 1,
     "expected": "4",
     "actual": "4.5"
    },
    {
     "type": "order",
     "task": "Посчитать, сколько слов в среднем приходится на строку.",
     "id": "basics.5",
     "lines": [
      "words = 96",
      "lines = 12",
      "average = words / lines",
      "print(average)"
     ],
     "expected": "8.0",
     "valid": [
      [
       0,
       1,
       2,
       3
      ],
      [
       1,
       0,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Поменять значения `a` и `b` местами через временную переменную.",
     "id": "basics.6",
     "lines": [
      "a = \"Keats\"",
      "b = \"Poe\"",
      "tmp = a",
      "a = b",
      "b = tmp",
      "print(a, b)"
     ],
     "expected": "Poe Keats",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       0,
       2,
       1,
       3,
       4,
       5
      ],
      [
       1,
       0,
       2,
       3,
       4,
       5
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши выражение: сколько строк не вошло в полные строфы?",
     "why": "Остаток от деления даёт `%`.",
     "id": "basics.7",
     "lines": [
      "lines = 18",
      "size = 4",
      "rest = ",
      "print(rest)"
     ],
     "gapLine": 2,
     "before": "rest = ",
     "after": "",
     "answer": "lines % size",
     "expected": "2"
    },
    {
     "type": "fill",
     "task": "Допиши: сколько букв в названии?",
     "why": "Длину строки, списка и словаря даёт `len()`.",
     "id": "basics.8",
     "lines": [
      "title = \"Ozymandias\"",
      "n = ",
      "print(n)"
     ],
     "gapLine": 1,
     "before": "n = ",
     "after": "",
     "answer": "len(title)",
     "expected": "10"
    },
    {
     "type": "write",
     "task": "Напиши функцию `full_stanzas(lines, size)`: сколько полных строф по `size` строк получится из `lines` строк.",
     "starter": "def full_stanzas(lines, size):\n    # твой код\n    pass",
     "solution": "def full_stanzas(lines, size):\n    return lines // size",
     "tests": [
      "full_stanzas(14, 4)",
      "full_stanzas(16, 4)",
      "full_stanzas(3, 4)"
     ],
     "hints": [
      "Нужна целая часть от деления.",
      "В Python это оператор `//`.",
      "`return lines // size`"
     ],
     "setup": "",
     "id": "basics.9",
     "testsPy": "_TESTS = [('full_stanzas(14, 4)', '3'), ('full_stanzas(16, 4)', '4'), ('full_stanzas(3, 4)', '0')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `average(total, count)`: среднее, округлённое до одного знака после точки.",
     "starter": "def average(total, count):\n    # твой код\n    pass",
     "solution": "def average(total, count):\n    return round(total / count, 1)",
     "tests": [
      "average(10, 4)",
      "average(7, 3)",
      "average(9, 3)"
     ],
     "hints": [
      "Раздели `total` на `count`.",
      "Для округления есть `round(число, знаков)`.",
      "`return round(total / count, 1)`"
     ],
     "setup": "",
     "id": "basics.10",
     "testsPy": "_TESTS = [('average(10, 4)', '2.5'), ('average(7, 3)', '2.3'), ('average(9, 3)', '3.0')]\n"
    },
    {
     "type": "predict",
     "code": "a = 10\na += 5\na *= 2\nprint(a)",
     "why": "`a += 5` — то же, что `a = a + 5`; потом всё умножается на 2.",
     "id": "basics.11",
     "expected": "30",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "a",
          "10"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "a",
          "15"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "a",
          "30"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "a",
          "30"
         ]
        ],
        "out": "30\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Доля длинных строк в процентах: 3 из 12.",
     "why": "Скобки меняют порядок действий: здесь сначала умножили `total` на 100.",
     "id": "basics.12",
     "fixedLine": "print(long_lines / total * 100)",
     "lines": [
      "long_lines = 3",
      "total = 12",
      "print(long_lines / (total * 100))"
     ],
     "bugLine": 2,
     "expected": "25.0",
     "actual": "0.0025"
    },
    {
     "type": "order",
     "task": "Перевести секунды чтения в минуты и секунды.",
     "id": "basics.13",
     "lines": [
      "seconds = 135",
      "minutes = seconds // 60",
      "rest = seconds % 60",
      "print(minutes, rest)"
     ],
     "expected": "2 15",
     "valid": [
      [
       0,
       1,
       2,
       3
      ],
      [
       0,
       2,
       1,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши выражение: сколько минут займёт чтение 300 слов при скорости 200 слов в минуту.",
     "why": "Время — количество слов, делённое на скорость.",
     "id": "basics.14",
     "lines": [
      "words = 300",
      "per_minute = 200",
      "print()"
     ],
     "gapLine": 2,
     "before": "print(",
     "after": ")",
     "answer": "words / per_minute",
     "expected": "1.5"
    },
    {
     "type": "write",
     "task": "Напиши функцию `reading_time(words)`: сколько полных минут нужно на текст при скорости 200 слов в минуту, с округлением вверх.",
     "starter": "def reading_time(words):\n    # твой код\n    pass",
     "solution": "def reading_time(words):\n    return (words + 199) // 200",
     "tests": [
      "reading_time(200)",
      "reading_time(201)",
      "reading_time(0)",
      "reading_time(450)"
     ],
     "hints": [
      "201 слово — это уже 2 минуты: нужно округлять вверх.",
      "Есть `math.ceil(x)`: сначала `import math`.",
      "`return math.ceil(words / 200)` после `import math`, или без импорта: `(words + 199) // 200`."
     ],
     "setup": "",
     "id": "basics.15",
     "testsPy": "_TESTS = [('reading_time(200)', '1'), ('reading_time(201)', '2'), ('reading_time(0)', '0'), ('reading_time(450)', '3')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "strings",
   "title": "Строки и f-строки",
   "diag": [
    "strings",
    "fstrings"
   ],
   "intro": "Строка — последовательность символов, нумерация с нуля. Срез `s[a:b]` берёт символы с a до b, не включая b. Методы `lower()`, `upper()`, `strip()`, `split()` возвращают новую строку или список. f-строка подставляет значения в `{}`.",
   "tasks": [
    {
     "type": "predict",
     "code": "word = \"Nevermore\"\nprint(word[0], word[-1], word[:5])",
     "why": "Нумерация с нуля, `-1` — последний символ, `[:5]` — первые пять символов.",
     "id": "strings.1",
     "expected": "N e Never",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "word",
          "'Nevermore'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "word",
          "'Nevermore'"
         ]
        ],
        "out": "N e Never\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "author = \"Poe\"\nprint(f\"{author.upper()}: {len(author)} letters\")",
     "why": "В фигурных скобках f-строки можно писать любые выражения.",
     "id": "strings.2",
     "expected": "POE: 3 letters",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "author",
          "'Poe'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "author",
          "'Poe'"
         ]
        ],
        "out": "POE: 3 letters\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Проверить, есть ли в строке слово «moon», не обращая внимания на регистр.",
     "why": "`in` различает регистр: «Moon» и «moon» — разные строки. Сначала приведи строку к нижнему регистру.",
     "id": "strings.3",
     "fixedLine": "found = \"moon\" in line.lower()",
     "lines": [
      "line = \"The Moon was a ghostly galleon\"",
      "found = \"moon\" in line",
      "print(found)"
     ],
     "bugLine": 1,
     "expected": "True",
     "actual": "False"
    },
    {
     "type": "bug",
     "task": "Убрать пробелы по краям и напечатать длину строки.",
     "why": "Без скобок `strip` — сам метод, а не результат. Методы вызывают со скобками: `strip()`.",
     "id": "strings.4",
     "fixedLine": "clean = line.strip()",
     "lines": [
      "line = \"  Hope is the thing with feathers  \"",
      "clean = line.strip",
      "print(len(clean))"
     ],
     "bugLine": 1,
     "expected": "31",
     "actual": "TypeError: object of type 'builtin_function_or_method' has no len()",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Разбить строку на слова и напечатать первое слово заглавными буквами.",
     "id": "strings.5",
     "lines": [
      "line = \"because I could not stop for death\"",
      "words = line.split()",
      "first = words[0]",
      "print(first.upper())"
     ],
     "expected": "BECAUSE",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Собрать из списка слов одну строку через пробел.",
     "id": "strings.6",
     "lines": [
      "words = [\"I\", \"wandered\", \"lonely\"]",
      "line = \" \".join(words)",
      "print(line)"
     ],
     "expected": "I wandered lonely",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы получить список слов.",
     "why": "`split()` без аргументов режет строку по пробелам.",
     "id": "strings.7",
     "lines": [
      "line = \"Shall I compare thee\"",
      "print(line.)"
     ],
     "gapLine": 1,
     "before": "print(line.",
     "after": ")",
     "answer": "split()",
     "expected": "['Shall', 'I', 'compare', 'thee']"
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы напечатать имя с заглавной буквы.",
     "why": "`capitalize()` делает первую букву заглавной, `title()` — первую букву каждого слова.",
     "id": "strings.8",
     "lines": [
      "name = \"keats\"",
      "print()"
     ],
     "gapLine": 1,
     "before": "print(",
     "after": ")",
     "answer": "name.capitalize()",
     "expected": "Keats"
    },
    {
     "type": "write",
     "task": "Напиши функцию `count_words(line)`: сколько слов в строке.",
     "starter": "def count_words(line):\n    # твой код\n    pass",
     "solution": "def count_words(line):\n    return len(line.split())",
     "tests": [
      "count_words(\"Hope is the thing\")",
      "count_words(\"Nevermore\")",
      "count_words(\"\")"
     ],
     "hints": [
      "Сначала разбей строку на слова.",
      "`line.split()` даёт список слов, его длину даёт `len()`.",
      "`return len(line.split())`"
     ],
     "setup": "",
     "id": "strings.9",
     "testsPy": "_TESTS = [('count_words(\"Hope is the thing\")', '4'), ('count_words(\"Nevermore\")', '1'), ('count_words(\"\")', '0')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `initials(name)`: инициалы через точки, «Emily Dickinson» → «E.D.».",
     "starter": "def initials(name):\n    # твой код\n    pass",
     "solution": "def initials(name):\n    result = \"\"\n    for word in name.split():\n        result += word[0] + \".\"\n    return result",
     "tests": [
      "initials(\"Emily Dickinson\")",
      "initials(\"Edgar Allan Poe\")",
      "initials(\"Keats\")"
     ],
     "hints": [
      "Пройди циклом по словам: `for word in name.split():`.",
      "Первая буква слова — `word[0]`. Добавляй к результату её и точку.",
      "Начни с `result = \"\"`, в цикле `result += word[0] + \".\"`, в конце `return result`."
     ],
     "setup": "",
     "id": "strings.10",
     "testsPy": "_TESTS = [('initials(\"Emily Dickinson\")', \"'E.D.'\"), ('initials(\"Edgar Allan Poe\")', \"'E.A.P.'\"), ('initials(\"Keats\")', \"'K.'\")]\n"
    },
    {
     "type": "predict",
     "code": "line = \"Tyger Tyger, burning bright\"\nprint(line.count(\"Tyger\"), line.find(\"burning\"))",
     "why": "`count` считает вхождения, `find` возвращает номер первого символа найденного куска.",
     "id": "strings.11",
     "expected": "2 13",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "line",
          "'Tyger Tyger, burning bright'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "line",
          "'Tyger Tyger, burning bright'"
         ]
        ],
        "out": "2 13\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Заменить все «thee» на «you».",
     "why": "Строки не меняются: `replace` возвращает новую строку, её нужно сохранить в переменную.",
     "id": "strings.12",
     "fixedLine": "new = line.replace(\"thee\", \"you\")",
     "lines": [
      "line = \"I love thee, I need thee\"",
      "line.replace(\"thee\", \"you\")",
      "print(new)"
     ],
     "bugLine": 1,
     "expected": "I love you, I need you",
     "actual": "NameError: name 'new' is not defined",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Напечатать первое слово, если оно с заглавной буквы.",
     "id": "strings.13",
     "lines": [
      "line = \"Hope is the thing\"",
      "first = line.split()[0]",
      "if first[0].isupper():",
      "    print(first)"
     ],
     "expected": "Hope",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы каждое слово было с заглавной буквы.",
     "why": "`title()` делает заглавной первую букву каждого слова.",
     "id": "strings.14",
     "lines": [
      "title = \"the raven\"",
      "print()"
     ],
     "gapLine": 1,
     "before": "print(",
     "after": ")",
     "answer": "title.title()",
     "expected": "The Raven"
    },
    {
     "type": "write",
     "task": "Напиши функцию `is_palindrome(word)`: True, если слово читается одинаково с обеих сторон, без учёта регистра.",
     "starter": "def is_palindrome(word):\n    # твой код\n    pass",
     "solution": "def is_palindrome(word):\n    w = word.lower()\n    return w == w[::-1]",
     "tests": [
      "is_palindrome(\"Level\")",
      "is_palindrome(\"Poe\")",
      "is_palindrome(\"a\")"
     ],
     "hints": [
      "Приведи слово к нижнему регистру.",
      "Срез `[::-1]` переворачивает строку.",
      "`w = word.lower()`, затем `return w == w[::-1]`."
     ],
     "setup": "",
     "id": "strings.15",
     "testsPy": "_TESTS = [('is_palindrome(\"Level\")', 'True'), ('is_palindrome(\"Poe\")', 'False'), ('is_palindrome(\"a\")', 'True')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "formatting",
   "title": "Форматирование чисел",
   "diag": [
    "fstrings"
   ],
   "intro": "В f-строке после двоеточия задают формат: `{x:.2f}` — два знака после точки, `{n:,}` — разделитель тысяч, `{p:.1%}` — проценты, `{s:<6}` — выровнять по левому краю в поле из 6 символов. Так печатают метрики моделей.",
   "tasks": [
    {
     "type": "predict",
     "code": "f1 = 0.87654\nprint(f\"F1: {f1:.2f}\")",
     "why": "`.2f` — два знака после точки, с округлением.",
     "id": "formatting.1",
     "expected": "F1: 0.88",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "f1",
          "0.87654"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "f1",
          "0.87654"
         ]
        ],
        "out": "F1: 0.88\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "share = 0.256\nprint(f\"{share:.1%}\", f\"{1234567:,}\")",
     "why": "`%` умножает на 100 и добавляет знак процента, `,` разделяет тысячи.",
     "id": "formatting.2",
     "expected": "25.6% 1,234,567",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "share",
          "0.256"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "share",
          "0.256"
         ]
        ],
        "out": "25.6% 1,234,567\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать точность с тремя знаками после точки.",
     "why": "Без точки `3f` — это ширина поля, а знаков после точки по умолчанию шесть. Число знаков задают после точки: `.3f`.",
     "id": "formatting.3",
     "fixedLine": "print(f\"accuracy = {acc:.3f}\")",
     "lines": [
      "acc = 0.91234",
      "print(f\"accuracy = {acc:3f}\")"
     ],
     "bugLine": 1,
     "expected": "accuracy = 0.912",
     "actual": "accuracy = 0.912340"
    },
    {
     "type": "bug",
     "task": "Подставить имя автора в строку.",
     "why": "Без буквы `f` перед кавычками подстановки не будет: напечатаются сами фигурные скобки.",
     "id": "formatting.4",
     "fixedLine": "print(f\"Author: {author}\")",
     "lines": [
      "author = \"Keats\"",
      "print(\"Author: {author}\")"
     ],
     "bugLine": 1,
     "expected": "Author: Keats",
     "actual": "Author: {author}"
    },
    {
     "type": "order",
     "task": "Напечатать метрики авторов ровными столбцами.",
     "id": "formatting.5",
     "lines": [
      "scores = {\"Keats\": 0.91, \"Poe\": 0.78}",
      "for name, f1 in scores.items():",
      "    print(f\"{name:<6}{f1:.2f}\")"
     ],
     "expected": "Keats 0.91\nPoe   0.78",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "order",
     "task": "Посчитать долю длинных стихотворений и напечатать её в процентах.",
     "id": "formatting.6",
     "lines": [
      "lengths = [14, 120, 30, 8]",
      "long = [n for n in lengths if n > 20]",
      "share = len(long) / len(lengths)",
      "print(f\"{share:.0%}\")"
     ],
     "expected": "50%",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши формат: три знака после точки.",
     "why": "Формат пишут после двоеточия: `:.3f`.",
     "id": "formatting.7",
     "lines": [
      "loss = 0.034567",
      "print(f\"loss: {loss}\")"
     ],
     "gapLine": 1,
     "before": "print(f\"loss: {loss",
     "after": "}\")",
     "answer": ":.3f",
     "expected": "loss: 0.035"
    },
    {
     "type": "fill",
     "task": "Допиши формат: разделитель тысяч.",
     "why": "Запятая после двоеточия разделяет тысячи.",
     "id": "formatting.8",
     "lines": [
      "n = 1234567",
      "print(f\"{n} words\")"
     ],
     "gapLine": 1,
     "before": "print(f\"{n",
     "after": "} words\")",
     "answer": ":,",
     "expected": "1,234,567 words"
    },
    {
     "type": "write",
     "task": "Напиши функцию `percent(part, total)`: доля в процентах с одним знаком, `percent(1, 4)` → `'25.0%'`.",
     "starter": "def percent(part, total):\n    # твой код\n    pass",
     "solution": "def percent(part, total):\n    return f\"{part / total:.1%}\"",
     "tests": [
      "percent(1, 4)",
      "percent(1, 3)",
      "percent(0, 5)"
     ],
     "hints": [
      "Сначала доля: `part / total`.",
      "Формат процентов с одним знаком — `:.1%`.",
      "`return f\"{part / total:.1%}\"`"
     ],
     "setup": "",
     "id": "formatting.9",
     "testsPy": "_TESTS = [('percent(1, 4)', \"'25.0%'\"), ('percent(1, 3)', \"'33.3%'\"), ('percent(0, 5)', \"'0.0%'\")]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `report(name, score)`: строка вида `'Keats: 0.91'` — оценка с двумя знаками.",
     "starter": "def report(name, score):\n    # твой код\n    pass",
     "solution": "def report(name, score):\n    return f\"{name}: {score:.2f}\"",
     "tests": [
      "report(\"Keats\", 0.9123)",
      "report(\"Poe\", 1)"
     ],
     "hints": [
      "Нужна f-строка с двумя подстановками.",
      "Две цифры после точки — формат `:.2f`, он работает и для целых чисел.",
      "`return f\"{name}: {score:.2f}\"`"
     ],
     "setup": "",
     "id": "formatting.10",
     "testsPy": "_TESTS = [('report(\"Keats\", 0.9123)', \"'Keats: 0.91'\"), ('report(\"Poe\", 1)', \"'Poe: 1.00'\")]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "lists",
   "title": "Списки",
   "diag": [
    "lists"
   ],
   "intro": "Список хранит значения по порядку: `items[0]` — первый, `items[-1]` — последний, `items[1:3]` — срез. `append()` и `sort()` меняют сам список и возвращают None, а `sorted()` создаёт новый.",
   "tasks": [
    {
     "type": "predict",
     "code": "poets = [\"Keats\", \"Poe\", \"Whitman\"]\npoets.append(\"Dickinson\")\nprint(len(poets), poets[-1])",
     "why": "`append` добавляет элемент в конец списка.",
     "id": "lists.1",
     "expected": "4 Dickinson",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "poets",
          "['Keats', 'Poe', 'Whitman']"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "poets",
          "['Keats', 'Poe', 'Whitman', 'Dickinson']"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "poets",
          "['Keats', 'Poe', 'Whitman', 'Dickinson']"
         ]
        ],
        "out": "4 Dickinson\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "nums = [5, 2, 9]\ns = sorted(nums)\nnums.sort(reverse=True)\nprint(s, nums)",
     "why": "`sorted()` возвращает новый список, а `.sort()` меняет сам список.",
     "id": "lists.2",
     "expected": "[2, 5, 9] [9, 5, 2]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "nums",
          "[5, 2, 9]"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "nums",
          "[5, 2, 9]"
         ],
         [
          "s",
          "[2, 5, 9]"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "nums",
          "[9, 5, 2]"
         ],
         [
          "s",
          "[2, 5, 9]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "nums",
          "[9, 5, 2]"
         ],
         [
          "s",
          "[2, 5, 9]"
         ]
        ],
        "out": "[2, 5, 9] [9, 5, 2]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать два последних стихотворения из списка.",
     "why": "`[-2]` — один элемент, а срез `[-2:]` — всё от предпоследнего до конца.",
     "id": "lists.3",
     "fixedLine": "print(poems[-2:])",
     "lines": [
      "poems = [\"Ozymandias\", \"The Raven\", \"Daffodils\", \"Hope\"]",
      "print(poems[-2])"
     ],
     "bugLine": 1,
     "expected": "['Daffodils', 'Hope']",
     "actual": "Daffodils"
    },
    {
     "type": "bug",
     "task": "Добавить строку в список и напечатать список.",
     "why": "`append` меняет список на месте и возвращает None. Если присвоить результат, список затрётся.",
     "id": "lists.4",
     "fixedLine": "lines.append(\"burning bright\")",
     "lines": [
      "lines = [\"Tyger Tyger\"]",
      "lines = lines.append(\"burning bright\")",
      "print(lines)"
     ],
     "bugLine": 1,
     "expected": "['Tyger Tyger', 'burning bright']",
     "actual": "None"
    },
    {
     "type": "order",
     "task": "Посчитать сумму и среднюю длину строк.",
     "id": "lists.5",
     "lines": [
      "lengths = [7, 5, 9, 3]",
      "total = sum(lengths)",
      "average = total / len(lengths)",
      "print(total, average)"
     ],
     "expected": "24 6.0",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Найти самое длинное слово.",
     "id": "lists.6",
     "lines": [
      "words = [\"hope\", \"feathers\", \"soul\"]",
      "longest = max(words, key=len)",
      "print(longest)"
     ],
     "expected": "feathers",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы напечатать второе слово.",
     "why": "Нумерация с нуля: второй элемент — `words[1]`.",
     "id": "lists.7",
     "lines": [
      "words = [\"the\", \"raven\", \"nevermore\"]",
      "print()"
     ],
     "gapLine": 1,
     "before": "print(",
     "after": ")",
     "answer": "words[1]",
     "expected": "raven"
    },
    {
     "type": "fill",
     "task": "Допиши строку, которая отсортирует список.",
     "why": "`nums.sort()` сортирует сам список. Подойдёт и `nums = sorted(nums)`.",
     "id": "lists.8",
     "lines": [
      "nums = [3, 1, 2]",
      "",
      "print(nums)"
     ],
     "gapLine": 1,
     "before": "",
     "after": "",
     "answer": "nums.sort()",
     "expected": "[1, 2, 3]"
    },
    {
     "type": "write",
     "task": "Напиши функцию `first_and_last(items)`: список из первого и последнего элемента.",
     "starter": "def first_and_last(items):\n    # твой код\n    pass",
     "solution": "def first_and_last(items):\n    return [items[0], items[-1]]",
     "tests": [
      "first_and_last([1, 2, 3])",
      "first_and_last([\"a\"])",
      "first_and_last([\"x\", \"y\"])"
     ],
     "hints": [
      "Первый элемент — `items[0]`, последний — `items[-1]`.",
      "Собери их в новый список квадратными скобками.",
      "`return [items[0], items[-1]]`"
     ],
     "setup": "",
     "id": "lists.9",
     "testsPy": "_TESTS = [('first_and_last([1, 2, 3])', '[1, 3]'), ('first_and_last([\"a\"])', \"['a', 'a']\"), ('first_and_last([\"x\", \"y\"])', \"['x', 'y']\")]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `without_first(items)`: новый список без первого элемента. Исходный список менять нельзя.",
     "starter": "def without_first(items):\n    # твой код\n    pass",
     "solution": "def without_first(items):\n    return items[1:]",
     "tests": [
      "without_first([1, 2, 3])",
      "without_first([1])",
      "without_first([])"
     ],
     "hints": [
      "Срез создаёт новый список и не меняет старый.",
      "Срез «со второго элемента до конца» — `[1:]`.",
      "`return items[1:]`"
     ],
     "setup": "",
     "id": "lists.10",
     "testsPy": "_TESTS = [('without_first([1, 2, 3])', '[2, 3]'), ('without_first([1])', '[]'), ('without_first([])', '[]')]\n"
    },
    {
     "type": "predict",
     "code": "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
     "why": "`b = a` не копирует список: обе переменные указывают на один и тот же список. Копия — `a.copy()` или `a[:]`.",
     "id": "lists.11",
     "expected": "[1, 2, 3]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "a",
          "[1, 2]"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "a",
          "[1, 2]"
         ],
         [
          "b",
          "[1, 2]"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "a",
          "[1, 2, 3]"
         ],
         [
          "b",
          "[1, 2, 3]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "a",
          "[1, 2, 3]"
         ],
         [
          "b",
          "[1, 2, 3]"
         ]
        ],
        "out": "[1, 2, 3]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Объединить два списка строк и посчитать строки.",
     "why": "`append` возвращает None. Списки склеивает `+` или `extend`.",
     "id": "lists.12",
     "fixedLine": "poem = first + second",
     "lines": [
      "first = [\"Tyger Tyger\"]",
      "second = [\"burning bright\"]",
      "poem = first.append(second)",
      "print(len(poem))"
     ],
     "bugLine": 2,
     "expected": "2",
     "actual": "TypeError: object of type 'NoneType' has no len()",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Перевернуть список и взять первые два элемента.",
     "id": "lists.13",
     "lines": [
      "words = [\"a\", \"b\", \"c\", \"d\"]",
      "backwards = words[::-1]",
      "print(backwards[:2])"
     ],
     "expected": "['d', 'c']",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: номер элемента 8 в списке.",
     "why": "`index` возвращает номер первого найденного элемента.",
     "id": "lists.14",
     "lines": [
      "nums = [4, 8, 15]",
      "print()"
     ],
     "gapLine": 1,
     "before": "print(",
     "after": ")",
     "answer": "nums.index(8)",
     "expected": "1"
    },
    {
     "type": "write",
     "task": "Напиши функцию `middle(items)`: средний элемент списка нечётной длины.",
     "starter": "def middle(items):\n    # твой код\n    pass",
     "solution": "def middle(items):\n    return items[len(items) // 2]",
     "tests": [
      "middle([1, 2, 3])",
      "middle([\"a\"])",
      "middle([1, 2, 3, 4, 5])"
     ],
     "hints": [
      "Номер середины зависит от длины списка.",
      "Для длины 5 середина — номер 2: `5 // 2`.",
      "`return items[len(items) // 2]`"
     ],
     "setup": "",
     "id": "lists.15",
     "testsPy": "_TESTS = [('middle([1, 2, 3])', '2'), ('middle([\"a\"])', \"'a'\"), ('middle([1, 2, 3, 4, 5])', '3')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "conditions",
   "title": "Условия",
   "diag": [
    "conditions"
   ],
   "intro": "`if` выполняет блок, если условие истинно. `elif` и `else` проверяются сверху вниз, срабатывает первая подходящая ветка. Сравнение — `==`, а `=` — присваивание. Условия соединяют `and` и `or`.",
   "tasks": [
    {
     "type": "predict",
     "code": "n = 7\nif n > 10:\n    print(\"long\")\nelif n > 5:\n    print(\"medium\")\nelse:\n    print(\"short\")",
     "why": "Python проверяет условия сверху вниз и выполняет первую подходящую ветку.",
     "id": "conditions.1",
     "expected": "medium",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "n",
          "7"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "n",
          "7"
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "n",
          "7"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "n",
          "7"
         ]
        ],
        "out": "medium\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "word = \"\"\nif word:\n    print(\"есть слово\")\nelse:\n    print(\"пусто\")",
     "why": "Пустая строка, 0, пустой список и None считаются ложью.",
     "id": "conditions.2",
     "expected": "пусто",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "word",
          "''"
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "word",
          "''"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "word",
          "''"
         ]
        ],
        "out": "пусто\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать «sonnet», если в стихотворении ровно 14 строк.",
     "why": "`=` присваивает значение, а сравнивает `==`.",
     "id": "conditions.3",
     "fixedLine": "if lines == 14:",
     "lines": [
      "lines = 14",
      "if lines = 14:",
      "    print(\"sonnet\")"
     ],
     "bugLine": 1,
     "expected": "sonnet",
     "actual": "SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Слово короткое, если в нём от 1 до 3 букв.",
     "why": "`or` истинно, если верно хотя бы одно условие. Здесь нужны оба сразу — это `and`.",
     "id": "conditions.4",
     "fixedLine": "if len(word) > 0 and len(word) < 4:",
     "lines": [
      "word = \"feathers\"",
      "if len(word) > 0 or len(word) < 4:",
      "    print(\"short\")",
      "else:",
      "    print(\"long\")"
     ],
     "bugLine": 1,
     "expected": "long",
     "actual": "short"
    },
    {
     "type": "order",
     "task": "Напечатать, чётное ли число строк.",
     "id": "conditions.5",
     "lines": [
      "lines = 9",
      "if lines % 2 == 0:",
      "    print(\"even\")",
      "else:",
      "    print(\"odd\")"
     ],
     "expected": "odd",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "order",
     "task": "Определить автора по слову.",
     "id": "conditions.6",
     "lines": [
      "word = \"nevermore\"",
      "author = \"unknown\"",
      "if word == \"nevermore\":",
      "    author = \"Poe\"",
      "print(author)"
     ],
     "expected": "Poe",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ],
      [
       0,
       2,
       3,
       4,
       1
      ],
      [
       1,
       0,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши условие: «pass», если оценка не меньше 0.5.",
     "why": "«Не меньше» — это `>=`.",
     "id": "conditions.7",
     "lines": [
      "score = 0.8",
      "label = \"pass\" if  else \"fail\"",
      "print(label)"
     ],
     "gapLine": 1,
     "before": "label = \"pass\" if ",
     "after": " else \"fail\"",
     "answer": "score >= 0.5",
     "expected": "pass"
    },
    {
     "type": "fill",
     "task": "Допиши условие: стихотворение написано раньше 1900 года.",
     "why": "«Раньше» — значит год меньше: `<`.",
     "id": "conditions.8",
     "lines": [
      "year = 1819",
      "if :",
      "    print(\"19th century or earlier\")"
     ],
     "gapLine": 1,
     "before": "if ",
     "after": ":",
     "answer": "year < 1900",
     "expected": "19th century or earlier"
    },
    {
     "type": "write",
     "task": "Напиши функцию `poem_size(lines)`: «short», если строк меньше 8; «medium» — от 8 до 20 включительно; иначе «long».",
     "starter": "def poem_size(lines):\n    # твой код\n    pass",
     "solution": "def poem_size(lines):\n    if lines < 8:\n        return \"short\"\n    elif lines <= 20:\n        return \"medium\"\n    else:\n        return \"long\"",
     "tests": [
      "poem_size(4)",
      "poem_size(8)",
      "poem_size(20)",
      "poem_size(21)"
     ],
     "hints": [
      "Три ветки: `if`, `elif`, `else`.",
      "Сначала проверь `lines < 8`, потом `lines <= 20`.",
      "Во второй ветке не нужно проверять `lines >= 8`: до неё доходим, только если первое условие ложно."
     ],
     "setup": "",
     "id": "conditions.9",
     "testsPy": "_TESTS = [('poem_size(4)', \"'short'\"), ('poem_size(8)', \"'medium'\"), ('poem_size(20)', \"'medium'\"), ('poem_size(21)', \"'long'\")]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `is_sonnet(lines)`: True, если строк ровно 14, иначе False.",
     "starter": "def is_sonnet(lines):\n    # твой код\n    pass",
     "solution": "def is_sonnet(lines):\n    return lines == 14",
     "tests": [
      "is_sonnet(14)",
      "is_sonnet(13)",
      "is_sonnet(0)"
     ],
     "hints": [
      "Сравнение `==` уже даёт True или False.",
      "`if` здесь не нужен: можно вернуть результат сравнения.",
      "`return lines == 14`"
     ],
     "setup": "",
     "id": "conditions.10",
     "testsPy": "_TESTS = [('is_sonnet(14)', 'True'), ('is_sonnet(13)', 'False'), ('is_sonnet(0)', 'False')]\n"
    },
    {
     "type": "predict",
     "code": "x = 5\nprint(x > 3 and x < 10, x < 3 or x == 5, not x == 5)",
     "why": "`and` — оба условия верны, `or` — хотя бы одно, `not` переворачивает значение.",
     "id": "conditions.11",
     "expected": "True True False",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "x",
          "5"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "x",
          "5"
         ]
        ],
        "out": "True True False\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Сообщить, что Блейка нет в списке авторов.",
     "why": "Нужно условие «нет в списке» — `not in`.",
     "id": "conditions.12",
     "fixedLine": "if \"Blake\" not in authors:",
     "lines": [
      "authors = [\"Poe\", \"Keats\"]",
      "if \"Blake\" in authors:",
      "    print(\"no Blake\")"
     ],
     "bugLine": 1,
     "expected": "no Blake",
     "actual": "(ничего)"
    },
    {
     "type": "order",
     "task": "Поставить оценку по баллу.",
     "id": "conditions.13",
     "lines": [
      "score = 72",
      "grade = \"C\"",
      "if score >= 90:",
      "    grade = \"A\"",
      "elif score >= 70:",
      "    grade = \"B\"",
      "print(grade)"
     ],
     "expected": "B",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5,
       6
      ],
      [
       0,
       2,
       3,
       4,
       5,
       6,
       1
      ],
      [
       1,
       0,
       2,
       3,
       4,
       5,
       6
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши вторую часть условного выражения.",
     "why": "Условное выражение: `значение if условие else другое_значение`.",
     "id": "conditions.14",
     "lines": [
      "lines = 14",
      "kind = \"sonnet\" if lines == 14 ",
      "print(kind)"
     ],
     "gapLine": 1,
     "before": "kind = \"sonnet\" if lines == 14 ",
     "after": "",
     "answer": "else \"other\"",
     "expected": "sonnet"
    },
    {
     "type": "write",
     "task": "Напиши функцию `season(month)`: `'winter'` для 12, 1, 2; `'summer'` для 6, 7, 8; иначе `'other'`.",
     "starter": "def season(month):\n    # твой код\n    pass",
     "solution": "def season(month):\n    if month in (12, 1, 2):\n        return \"winter\"\n    if month in (6, 7, 8):\n        return \"summer\"\n    return \"other\"",
     "tests": [
      "season(1)",
      "season(12)",
      "season(7)",
      "season(4)"
     ],
     "hints": [
      "Проверить, входит ли месяц в набор, можно через `in`: `month in (12, 1, 2)`.",
      "Две проверки и ответ по умолчанию в конце.",
      "`if month in (12, 1, 2): return \"winter\"`, потом так же для лета, в конце `return \"other\"`."
     ],
     "setup": "",
     "id": "conditions.15",
     "testsPy": "_TESTS = [('season(1)', \"'winter'\"), ('season(12)', \"'winter'\"), ('season(7)', \"'summer'\"), ('season(4)', \"'other'\")]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "loops",
   "title": "Циклы",
   "diag": [
    "loops"
   ],
   "intro": "`for` проходит по элементам списка, строки или `range()`. `range(a, b)` — числа от a до b, не включая b. Чтобы копить результат, переменную создают до цикла и меняют внутри: `total += x`.",
   "tasks": [
    {
     "type": "predict",
     "code": "total = 0\nfor n in [3, 4, 5]:\n    total += n\nprint(total)",
     "why": "`total += n` прибавляет каждое число к сумме: 3 + 4 + 5.",
     "id": "loops.1",
     "expected": "12",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "total",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "total",
          "0"
         ],
         [
          "n",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "total",
          "3"
         ],
         [
          "n",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "total",
          "3"
         ],
         [
          "n",
          "4"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "total",
          "7"
         ],
         [
          "n",
          "4"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "total",
          "7"
         ],
         [
          "n",
          "5"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "total",
          "12"
         ],
         [
          "n",
          "5"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "total",
          "12"
         ],
         [
          "n",
          "5"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "total",
          "12"
         ],
         [
          "n",
          "5"
         ]
        ],
        "out": "12\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "for i in range(1, 4):\n    print(i * \"*\")",
     "why": "Строку можно умножить на число: `2 * \"*\"` — это `\"**\"`.",
     "id": "loops.2",
     "expected": "*\n**\n***",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "i",
          "1"
         ]
        ],
        "out": ""
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "i",
          "1"
         ]
        ],
        "out": "*\n"
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "i",
          "2"
         ]
        ],
        "out": "*\n"
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "i",
          "2"
         ]
        ],
        "out": "*\n**\n"
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "i",
          "3"
         ]
        ],
        "out": "*\n**\n"
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "i",
          "3"
         ]
        ],
        "out": "*\n**\n***\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "i",
          "3"
         ]
        ],
        "out": "*\n**\n***\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать номера строк от 1 до 3.",
     "why": "`range(3)` — это 0, 1, 2. Начало по умолчанию 0, а конец не входит.",
     "id": "loops.3",
     "fixedLine": "for i in range(1, 4):",
     "lines": [
      "for i in range(3):",
      "    print(i)"
     ],
     "bugLine": 0,
     "expected": "1\n2\n3",
     "actual": "0\n1\n2"
    },
    {
     "type": "bug",
     "task": "Сложить длины всех слов.",
     "why": "`=` каждый раз перезаписывает сумму. Чтобы копить, нужно `+=`.",
     "id": "loops.4",
     "fixedLine": "    total += len(w)",
     "lines": [
      "words = [\"hope\", \"is\", \"the\"]",
      "total = 0",
      "for w in words:",
      "    total = len(w)",
      "print(total)"
     ],
     "bugLine": 3,
     "expected": "9",
     "actual": "3"
    },
    {
     "type": "order",
     "task": "Посчитать, сколько слов длиннее трёх букв.",
     "id": "loops.5",
     "lines": [
      "words = [\"the\", \"raven\", \"said\", \"nevermore\"]",
      "count = 0",
      "for w in words:",
      "    if len(w) > 3:",
      "        count += 1",
      "print(count)"
     ],
     "expected": "3",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       1,
       0,
       2,
       3,
       4,
       5
      ]
     ]
    },
    {
     "type": "order",
     "task": "Пронумеровать строки, начиная с единицы.",
     "id": "loops.6",
     "lines": [
      "lines = [\"Tyger Tyger\", \"burning bright\"]",
      "for i, line in enumerate(lines, start=1):",
      "    print(i, line)"
     ],
     "expected": "1 Tyger Tyger\n2 burning bright",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы получился обратный отсчёт от 5 до 1.",
     "why": "Третий аргумент `range` — шаг. С шагом -1 числа идут вниз, а конец, 0, не входит.",
     "id": "loops.7",
     "lines": [
      "for i in :",
      "    print(i)"
     ],
     "gapLine": 0,
     "before": "for i in ",
     "after": ":",
     "answer": "range(5, 0, -1)",
     "expected": "5\n4\n3\n2\n1"
    },
    {
     "type": "fill",
     "task": "Допиши строку, которая копит сумму чисел от 1 до 4.",
     "why": "`total += n` — то же, что `total = total + n`.",
     "id": "loops.8",
     "lines": [
      "total = 0",
      "for n in range(1, 5):",
      "    ",
      "print(total)"
     ],
     "gapLine": 2,
     "before": "    ",
     "after": "",
     "answer": "total += n",
     "expected": "10"
    },
    {
     "type": "write",
     "task": "Напиши функцию `count_long(words, n)`: сколько слов длиннее `n` букв.",
     "starter": "def count_long(words, n):\n    # твой код\n    pass",
     "solution": "def count_long(words, n):\n    count = 0\n    for w in words:\n        if len(w) > n:\n            count += 1\n    return count",
     "tests": [
      "count_long([\"a\", \"bb\", \"ccc\"], 1)",
      "count_long([], 3)",
      "count_long([\"raven\", \"the\"], 3)"
     ],
     "hints": [
      "Заведи счётчик `count = 0` до цикла.",
      "В цикле проверь `if len(w) > n:` и увеличь счётчик.",
      "После цикла верни `count`. Следи, чтобы `return` стоял без отступа цикла."
     ],
     "setup": "",
     "id": "loops.9",
     "testsPy": "_TESTS = [('count_long([\"a\", \"bb\", \"ccc\"], 1)', '2'), ('count_long([], 3)', '0'), ('count_long([\"raven\", \"the\"], 3)', '1')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `longest_line(lines)`: номер самой длинной строки, считая с 1. Если длинных несколько — первой из них.",
     "starter": "def longest_line(lines):\n    # твой код\n    pass",
     "solution": "def longest_line(lines):\n    best = 0\n    for i in range(len(lines)):\n        if len(lines[i]) > len(lines[best]):\n            best = i\n    return best + 1",
     "tests": [
      "longest_line([\"a\", \"bbb\", \"cc\"])",
      "longest_line([\"xx\", \"yy\"])",
      "longest_line([\"one\"])"
     ],
     "hints": [
      "Запоминай номер лучшей строки: `best = 0`.",
      "Меняй `best`, только если новая строка строго длиннее: `>` , а не `>=`.",
      "Номера в Python с нуля, а ответ нужен с единицы: верни `best + 1`."
     ],
     "setup": "",
     "id": "loops.10",
     "testsPy": "_TESTS = [('longest_line([\"a\", \"bbb\", \"cc\"])', '2'), ('longest_line([\"xx\", \"yy\"])', '1'), ('longest_line([\"one\"])', '1')]\n"
    },
    {
     "type": "predict",
     "code": "for w in [\"sea\", \"stop\", \"sky\"]:\n    if w == \"stop\":\n        break\n    print(w)\nprint(\"end\")",
     "why": "`break` сразу выходит из цикла, поэтому sky не печатается.",
     "id": "loops.11",
     "expected": "sea\nend",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": "sea\n"
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'stop'"
         ]
        ],
        "out": "sea\n"
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "w",
          "'stop'"
         ]
        ],
        "out": "sea\n"
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "w",
          "'stop'"
         ]
        ],
        "out": "sea\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "w",
          "'stop'"
         ]
        ],
        "out": "sea\nend\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Найти первое слово длиннее четырёх букв.",
     "why": "`continue` переходит к следующему слову, а `break` останавливает цикл после первой находки.",
     "id": "loops.12",
     "fixedLine": "        break",
     "lines": [
      "words = [\"sea\", \"raven\", \"nevermore\"]",
      "for w in words:",
      "    if len(w) > 4:",
      "        print(w)",
      "        continue"
     ],
     "bugLine": 4,
     "expected": "raven",
     "actual": "raven\nnevermore"
    },
    {
     "type": "order",
     "task": "Напечатать строки с чётными номерами.",
     "id": "loops.13",
     "lines": [
      "lines = [\"a\", \"b\", \"c\", \"d\"]",
      "for i in range(len(lines)):",
      "    if i % 2 == 1:",
      "        continue",
      "    print(i, lines[i])"
     ],
     "expected": "0 a\n2 c",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши условие: буква — гласная.",
     "why": "`in` проверяет, есть ли символ в строке гласных.",
     "id": "loops.14",
     "lines": [
      "word = \"raven\"",
      "count = 0",
      "for ch in word:",
      "    if ch :",
      "        count += 1",
      "print(count)"
     ],
     "gapLine": 3,
     "before": "    if ch ",
     "after": ":",
     "answer": "in \"aeiou\"",
     "expected": "2"
    },
    {
     "type": "write",
     "task": "Напиши функцию `first_long(words, n)`: первое слово длиннее `n` букв или None, если такого нет.",
     "starter": "def first_long(words, n):\n    # твой код\n    pass",
     "solution": "def first_long(words, n):\n    for w in words:\n        if len(w) > n:\n            return w\n    return None",
     "tests": [
      "first_long([\"a\", \"bbb\", \"cccc\"], 2)",
      "first_long([\"a\"], 3)"
     ],
     "hints": [
      "Пройди по словам циклом.",
      "Как только нашлось подходящее, сразу верни его: `return w`.",
      "После цикла, если ничего не нашлось, `return None`."
     ],
     "setup": "",
     "id": "loops.15",
     "testsPy": "_TESTS = [('first_long([\"a\", \"bbb\", \"cccc\"], 2)', \"'bbb'\"), ('first_long([\"a\"], 3)', 'None')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "zipenum",
   "title": "zip, enumerate и распаковка",
   "diag": [
    "loops"
   ],
   "intro": "`enumerate(items, start=1)` даёт пары «номер, элемент». `zip(a, b)` идёт по двум спискам параллельно и останавливается на самом коротком. Распаковка раскладывает пару по переменным: `a, b = pair`. Кортеж — неизменяемый список в круглых скобках.",
   "tasks": [
    {
     "type": "predict",
     "code": "for i, w in enumerate([\"sea\", \"sky\"], start=1):\n    print(i, w)",
     "why": "`enumerate` даёт номер вместе с элементом, `start=1` — считать с единицы.",
     "id": "zipenum.1",
     "expected": "1 sea\n2 sky",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "i",
          "1"
         ],
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "i",
          "1"
         ],
         [
          "w",
          "'sea'"
         ]
        ],
        "out": "1 sea\n"
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "i",
          "2"
         ],
         [
          "w",
          "'sky'"
         ]
        ],
        "out": "1 sea\n"
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "i",
          "2"
         ],
         [
          "w",
          "'sky'"
         ]
        ],
        "out": "1 sea\n2 sky\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "i",
          "2"
         ],
         [
          "w",
          "'sky'"
         ]
        ],
        "out": "1 sea\n2 sky\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "names = [\"Keats\", \"Poe\", \"Blake\"]\nyears = [1795, 1809]\nprint(list(zip(names, years)))",
     "why": "`zip` останавливается на самом коротком списке, поэтому Блейка нет.",
     "id": "zipenum.2",
     "expected": "[('Keats', 1795), ('Poe', 1809)]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "names",
          "['Keats', 'Poe', 'Blake']"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "names",
          "['Keats', 'Poe', 'Blake']"
         ],
         [
          "years",
          "[1795, 1809]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "names",
          "['Keats', 'Poe', 'Blake']"
         ],
         [
          "years",
          "[1795, 1809]"
         ]
        ],
        "out": "[('Keats', 1795), ('Poe', 1809)]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать стихотворения рядом с авторами.",
     "why": "Без `zip` цикл идёт по двум спискам целиком и раскладывает каждый список на две переменные, а не составляет пары.",
     "id": "zipenum.3",
     "fixedLine": "for t, a in zip(titles, authors):",
     "lines": [
      "titles = [\"Ozymandias\", \"The Raven\"]",
      "authors = [\"Shelley\", \"Poe\"]",
      "for t, a in titles, authors:",
      "    print(t, \"-\", a)"
     ],
     "bugLine": 2,
     "expected": "Ozymandias - Shelley\nThe Raven - Poe",
     "actual": "Ozymandias - The Raven\nShelley - Poe"
    },
    {
     "type": "bug",
     "task": "Разложить пару «автор, год» по переменным.",
     "why": "Переменных слева должно быть столько же, сколько значений в кортеже.",
     "id": "zipenum.4",
     "fixedLine": "name, year = pair",
     "lines": [
      "pair = (\"Poe\", 1809)",
      "name, year, place = pair",
      "print(name, year)"
     ],
     "bugLine": 1,
     "expected": "Poe 1809",
     "actual": "ValueError: not enough values to unpack (expected 3, got 2)",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Найти номер самого длинного слова.",
     "id": "zipenum.5",
     "lines": [
      "words = [\"sea\", \"nevermore\", \"sky\"]",
      "best = 0",
      "for i, w in enumerate(words):",
      "    if len(w) > len(words[best]):",
      "        best = i",
      "print(best)"
     ],
     "expected": "1",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       1,
       0,
       2,
       3,
       4,
       5
      ]
     ]
    },
    {
     "type": "order",
     "task": "Сложить два списка поэлементно.",
     "id": "zipenum.6",
     "lines": [
      "a = [1, 2, 3]",
      "b = [10, 20, 30]",
      "sums = [x + y for x, y in zip(a, b)]",
      "print(sums)"
     ],
     "expected": "[11, 22, 33]",
     "valid": [
      [
       0,
       1,
       2,
       3
      ],
      [
       1,
       0,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы получить номер и значение каждого элемента.",
     "why": "`enumerate` считает с нуля, если не указать `start`.",
     "id": "zipenum.7",
     "lines": [
      "scores = [0.7, 0.9]",
      "for i, s in :",
      "    print(i, s)"
     ],
     "gapLine": 1,
     "before": "for i, s in ",
     "after": ":",
     "answer": "enumerate(scores)",
     "expected": "0 0.7\n1 0.9"
    },
    {
     "type": "fill",
     "task": "Допиши левую часть: разложи точку на две переменные.",
     "why": "Распаковка: `x, y = point`.",
     "id": "zipenum.8",
     "lines": [
      "point = (3, 4)",
      " = point",
      "print(x * y)"
     ],
     "gapLine": 1,
     "before": "",
     "after": " = point",
     "answer": "x, y",
     "expected": "12"
    },
    {
     "type": "write",
     "task": "Напиши функцию `pairs(names, years)`: список строк вида `'Keats (1795)'` для пар из двух списков.",
     "starter": "def pairs(names, years):\n    # твой код\n    pass",
     "solution": "def pairs(names, years):\n    return [f\"{n} ({y})\" for n, y in zip(names, years)]",
     "tests": [
      "pairs([\"Keats\", \"Poe\"], [1795, 1809])",
      "pairs([], [])"
     ],
     "hints": [
      "Пройди по парам: `for n, y in zip(names, years)`.",
      "Строку собери f-строкой: `f\"{n} ({y})\"`.",
      "Одной строкой: `return [f\"{n} ({y})\" for n, y in zip(names, years)]`"
     ],
     "setup": "",
     "id": "zipenum.9",
     "testsPy": "_TESTS = [('pairs([\"Keats\", \"Poe\"], [1795, 1809])', \"['Keats (1795)', 'Poe (1809)']\"), ('pairs([], [])', '[]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `numbered(lines)`: список строк вида `'1. текст'`, нумерация с единицы.",
     "starter": "def numbered(lines):\n    # твой код\n    pass",
     "solution": "def numbered(lines):\n    return [f\"{i}. {line}\" for i, line in enumerate(lines, start=1)]",
     "tests": [
      "numbered([\"Tyger\", \"burning\"])",
      "numbered([])"
     ],
     "hints": [
      "Номер и строку даёт `enumerate(lines, start=1)`.",
      "Строку собери f-строкой: `f\"{i}. {line}\"`.",
      "`return [f\"{i}. {line}\" for i, line in enumerate(lines, start=1)]`"
     ],
     "setup": "",
     "id": "zipenum.10",
     "testsPy": "_TESTS = [('numbered([\"Tyger\", \"burning\"])', \"['1. Tyger', '2. burning']\"), ('numbered([])', '[]')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "dicts",
   "title": "Словари и множества",
   "diag": [
    "dicts",
    "sets"
   ],
   "intro": "Словарь хранит пары «ключ → значение»: `d[key]`. Если ключа может не быть, используй `d.get(key, 0)`. Множество хранит только разные значения: `set(words)` убирает повторы.",
   "tasks": [
    {
     "type": "predict",
     "code": "counts = {\"hope\": 2, \"soul\": 1}\ncounts[\"hope\"] += 1\ncounts[\"bird\"] = 1\nprint(counts)",
     "why": "Присваивание по новому ключу добавляет пару, по старому — меняет значение.",
     "id": "dicts.1",
     "expected": "{'hope': 3, 'soul': 1, 'bird': 1}",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "counts",
          "{'hope': 2, 'soul': 1}"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "counts",
          "{'hope': 3, 'soul': 1}"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "counts",
          "{'hope': 3, 'soul': 1, 'bird': 1}"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "counts",
          "{'hope': 3, 'soul': 1, 'bird': 1}"
         ]
        ],
        "out": "{'hope': 3, 'soul': 1, 'bird': 1}\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "words = [\"the\", \"sea\", \"the\", \"sky\", \"sea\"]\nprint(len(words), len(set(words)))",
     "why": "Во множестве каждое значение встречается один раз.",
     "id": "dicts.2",
     "expected": "5 3",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "words",
          "['the', 'sea', 'the', 'sky', 'sea']"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "words",
          "['the', 'sea', 'the', 'sky', 'sea']"
         ]
        ],
        "out": "5 3\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Узнать, сколько раз встретилось слово, даже если его нет в словаре.",
     "why": "Обращение по несуществующему ключу даёт KeyError. `get(key, 0)` вернёт 0.",
     "id": "dicts.3",
     "fixedLine": "print(counts.get(\"sun\", 0))",
     "lines": [
      "counts = {\"moon\": 3}",
      "print(counts[\"sun\"])"
     ],
     "bugLine": 1,
     "expected": "0",
     "actual": "KeyError: 'sun'",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Посчитать, сколько раз встречается каждое слово.",
     "why": "Так каждое слово всегда получает 1. Нужно взять старое значение и прибавить 1.",
     "id": "dicts.4",
     "fixedLine": "    counts[w] = counts.get(w, 0) + 1",
     "lines": [
      "words = [\"sea\", \"sky\", \"sea\"]",
      "counts = {}",
      "for w in words:",
      "    counts[w] = 1",
      "print(counts)"
     ],
     "bugLine": 3,
     "expected": "{'sea': 2, 'sky': 1}",
     "actual": "{'sea': 1, 'sky': 1}"
    },
    {
     "type": "order",
     "task": "Найти слова, которые есть в обеих строках.",
     "id": "dicts.5",
     "lines": [
      "a = set(\"the sea and the sky\".split())",
      "b = set(\"the moon and the stars\".split())",
      "common = a & b",
      "print(sorted(common))"
     ],
     "expected": "['and', 'the']",
     "valid": [
      [
       0,
       1,
       2,
       3
      ],
      [
       1,
       0,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Перебрать словарь и напечатать пары.",
     "id": "dicts.6",
     "lines": [
      "years = {\"Keats\": 1795, \"Poe\": 1809}",
      "for name, year in years.items():",
      "    print(name, year)"
     ],
     "expected": "Keats 1795\nPoe 1809",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы напечатать год рождения По.",
     "why": "Значение достают по ключу в квадратных скобках.",
     "id": "dicts.7",
     "lines": [
      "born = {\"Keats\": 1795, \"Poe\": 1809}",
      "print(born)"
     ],
     "gapLine": 1,
     "before": "print(born",
     "after": ")",
     "answer": "[\"Poe\"]",
     "expected": "1809"
    },
    {
     "type": "fill",
     "task": "Допиши строку, которая добавляет слово во множество.",
     "why": "У множества метод `add`. Повтор «sea» не добавится.",
     "id": "dicts.8",
     "lines": [
      "seen = set()",
      "for w in [\"sea\", \"sky\", \"sea\"]:",
      "    ",
      "print(len(seen))"
     ],
     "gapLine": 2,
     "before": "    ",
     "after": "",
     "answer": "seen.add(w)",
     "expected": "2"
    },
    {
     "type": "write",
     "task": "Напиши функцию `word_counts(words)`: словарь «слово → сколько раз встретилось».",
     "starter": "def word_counts(words):\n    # твой код\n    pass",
     "solution": "def word_counts(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts",
     "tests": [
      "word_counts([\"a\", \"b\", \"a\"])",
      "word_counts([])"
     ],
     "hints": [
      "Начни с пустого словаря `counts = {}`.",
      "Для каждого слова: `counts[w] = counts.get(w, 0) + 1`.",
      "После цикла `return counts`."
     ],
     "setup": "",
     "id": "dicts.9",
     "testsPy": "_TESTS = [('word_counts([\"a\", \"b\", \"a\"])', \"{'a': 2, 'b': 1}\"), ('word_counts([])', '{}')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `unique_count(text)`: сколько разных слов в тексте, без учёта регистра.",
     "starter": "def unique_count(text):\n    # твой код\n    pass",
     "solution": "def unique_count(text):\n    return len(set(text.lower().split()))",
     "tests": [
      "unique_count(\"The sea the Sea\")",
      "unique_count(\"\")",
      "unique_count(\"Hope\")"
     ],
     "hints": [
      "Приведи текст к нижнему регистру и разбей на слова.",
      "Множество из списка уберёт повторы.",
      "`return len(set(text.lower().split()))`"
     ],
     "setup": "",
     "id": "dicts.10",
     "testsPy": "_TESTS = [('unique_count(\"The sea the Sea\")', '2'), ('unique_count(\"\")', '0'), ('unique_count(\"Hope\")', '1')]\n"
    },
    {
     "type": "predict",
     "code": "d = {\"a\": 1}\nprint(\"a\" in d, \"b\" in d, len(d))",
     "why": "`in` проверяет ключи словаря.",
     "id": "dicts.11",
     "expected": "True False 1",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "d",
          "{'a': 1}"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "d",
          "{'a': 1}"
         ]
        ],
        "out": "True False 1\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать имена авторов по алфавиту.",
     "why": "`sorted(years)` сортирует ключи, а `values()` — значения.",
     "id": "dicts.12",
     "fixedLine": "for name in sorted(years):",
     "lines": [
      "years = {\"Poe\": 1809, \"Keats\": 1795}",
      "for name in sorted(years.values()):",
      "    print(name)"
     ],
     "bugLine": 1,
     "expected": "Keats\nPoe",
     "actual": "1795\n1809"
    },
    {
     "type": "order",
     "task": "Найти автора с самым ранним годом рождения.",
     "id": "dicts.13",
     "lines": [
      "years = {\"Poe\": 1809, \"Keats\": 1795, \"Blake\": 1757}",
      "oldest = min(years, key=years.get)",
      "print(oldest, years[oldest])"
     ],
     "expected": "Blake 1757",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: увеличить счётчик слова на 1.",
     "why": "`+=` работает и со значениями словаря.",
     "id": "dicts.14",
     "lines": [
      "counts = {\"sea\": 2}",
      "counts[\"sea\"] ",
      "print(counts)"
     ],
     "gapLine": 1,
     "before": "counts[\"sea\"] ",
     "after": "",
     "answer": "+= 1",
     "expected": "{'sea': 3}"
    },
    {
     "type": "write",
     "task": "Напиши функцию `invert(d)`: новый словарь, где ключи и значения поменялись местами.",
     "starter": "def invert(d):\n    # твой код\n    pass",
     "solution": "def invert(d):\n    return {v: k for k, v in d.items()}",
     "tests": [
      "invert({\"a\": 1, \"b\": 2})",
      "invert({})"
     ],
     "hints": [
      "Пары ключ-значение даёт `d.items()`.",
      "Словарный генератор: `{новый_ключ: новое_значение for k, v in d.items()}`.",
      "`return {v: k for k, v in d.items()}`"
     ],
     "setup": "",
     "id": "dicts.15",
     "testsPy": "_TESTS = [('invert({\"a\": 1, \"b\": 2})', \"{1: 'a', 2: 'b'}\"), ('invert({})', '{}')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "nested",
   "title": "Список словарей",
   "diag": [
    "dicts",
    "lists"
   ],
   "intro": "Данные из JSON и API обычно выглядят как список словарей: каждый словарь — одна запись. По записям идут циклом, поле берут по ключу: `poem[\"author\"]`. Так в проекте 1 приходят стихи из PoetryDB.",
   "tasks": [
    {
     "type": "predict",
     "code": "poems = [{\"title\": \"Hope\", \"lines\": 12}, {\"title\": \"Raven\", \"lines\": 108}]\nprint(poems[1][\"title\"], len(poems))",
     "why": "Сначала номер записи в списке, потом ключ в словаре.",
     "id": "nested.1",
     "expected": "Raven 2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'title': 'Hope', 'lines': 12}, {'title': 'Raven', 'line..."
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'title': 'Hope', 'lines': 12}, {'title': 'Raven', 'line..."
         ]
        ],
        "out": "Raven 2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "poems = [{\"author\": \"Poe\", \"lines\": 108}, {\"author\": \"Keats\", \"lines\": 14}, {\"author\": \"Poe\", \"lines\": 20}]\ntotal = 0\nfor p in poems:\n    if p[\"author\"] == \"Poe\":\n        total += p[\"lines\"]\nprint(total)",
     "why": "Цикл проходит по записям, условие отбирает записи По: 108 + 20.",
     "id": "nested.2",
     "expected": "128",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "0"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 108}"
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "0"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 108}"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "108"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 108}"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "108"
         ],
         [
          "p",
          "{'author': 'Keats', 'lines': 14}"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "108"
         ],
         [
          "p",
          "{'author': 'Keats', 'lines': 14}"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "108"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 20}"
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "108"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 20}"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "128"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 20}"
         ]
        ],
        "out": ""
       },
       {
        "line": 5,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "128"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 20}"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "poems",
          "[{'author': 'Poe', 'lines': 108}, {'author': 'Keats', 'li..."
         ],
         [
          "total",
          "128"
         ],
         [
          "p",
          "{'author': 'Poe', 'lines': 20}"
         ]
        ],
        "out": "128\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Напечатать названия всех стихотворений.",
     "why": "`poems` — список, у него номера, а не ключи. Ключ `\"title\"` есть у каждого словаря `p` внутри списка.",
     "id": "nested.3",
     "fixedLine": "    print(p[\"title\"])",
     "lines": [
      "poems = [{\"title\": \"Hope\"}, {\"title\": \"Raven\"}]",
      "for p in poems:",
      "    print(poems[\"title\"])"
     ],
     "bugLine": 2,
     "expected": "Hope\nRaven",
     "actual": "TypeError: list indices must be integers or slices, not str",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Собрать словарь «автор → список названий».",
     "why": "Присваивание каждый раз создаёт новый список и затирает старый. `setdefault(ключ, [])` берёт существующий список или создаёт пустой.",
     "id": "nested.4",
     "fixedLine": "    by_author.setdefault(author, []).append(title)",
     "lines": [
      "poems = [(\"Poe\", \"Raven\"), (\"Keats\", \"Autumn\"), (\"Poe\", \"Lenore\")]",
      "by_author = {}",
      "for author, title in poems:",
      "    by_author[author] = [title]",
      "print(by_author)"
     ],
     "bugLine": 3,
     "expected": "{'Poe': ['Raven', 'Lenore'], 'Keats': ['Autumn']}",
     "actual": "{'Poe': ['Lenore'], 'Keats': ['Autumn']}"
    },
    {
     "type": "order",
     "task": "Найти самое длинное стихотворение.",
     "id": "nested.5",
     "lines": [
      "poems = [{\"title\": \"Hope\", \"lines\": 12}, {\"title\": \"Raven\", \"lines\": 108}]",
      "best = poems[0]",
      "for p in poems:",
      "    if p[\"lines\"] > best[\"lines\"]:",
      "        best = p",
      "print(best[\"title\"])"
     ],
     "expected": "Raven",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ]
     ]
    },
    {
     "type": "order",
     "task": "Достать из записи список строк и посчитать их.",
     "id": "nested.6",
     "lines": [
      "poem = {\"title\": \"Tyger\", \"lines\": [\"Tyger Tyger\", \"burning bright\"]}",
      "lines = poem[\"lines\"]",
      "count = len(lines)",
      "print(poem[\"title\"], count)"
     ],
     "expected": "Tyger 2",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши путь к названию второго стихотворения.",
     "why": "Идём по уровням: ключ `\"poems\"`, номер 1, ключ `\"title\"`.",
     "id": "nested.7",
     "lines": [
      "data = {\"author\": \"Poe\", \"poems\": [{\"title\": \"Raven\"}, {\"title\": \"Lenore\"}]}",
      "print(data)"
     ],
     "gapLine": 1,
     "before": "print(data",
     "after": ")",
     "answer": "[\"poems\"][1][\"title\"]",
     "expected": "Lenore"
    },
    {
     "type": "fill",
     "task": "Допиши выражение: список названий.",
     "why": "Для каждой записи `p` берём `p[\"title\"]`.",
     "id": "nested.8",
     "lines": [
      "poems = [{\"title\": \"Hope\", \"lines\": 12}, {\"title\": \"Raven\", \"lines\": 108}]",
      "titles = [ for p in poems]",
      "print(titles)"
     ],
     "gapLine": 1,
     "before": "titles = [",
     "after": " for p in poems]",
     "answer": "p[\"title\"]",
     "expected": "['Hope', 'Raven']"
    },
    {
     "type": "write",
     "task": "Напиши функцию `titles_by(poems, author)`: названия стихотворений этого автора. Каждое стихотворение — словарь с ключами `\"title\"` и `\"author\"`.",
     "starter": "def titles_by(poems, author):\n    # твой код\n    pass",
     "solution": "def titles_by(poems, author):\n    return [p[\"title\"] for p in poems if p[\"author\"] == author]",
     "tests": [
      "titles_by([{\"title\": \"Raven\", \"author\": \"Poe\"}, {\"title\": \"Autumn\", \"author\": \"Keats\"}], \"Poe\")",
      "titles_by([], \"Poe\")"
     ],
     "hints": [
      "Пройди по записям и отбери те, где `p[\"author\"] == author`.",
      "Из подходящих записей возьми `p[\"title\"]`.",
      "`return [p[\"title\"] for p in poems if p[\"author\"] == author]`"
     ],
     "setup": "",
     "id": "nested.9",
     "testsPy": "_TESTS = [('titles_by([{\"title\": \"Raven\", \"author\": \"Poe\"}, {\"title\": \"Autumn\", \"author\": \"Keats\"}], \"Poe\")', \"['Raven']\"), ('titles_by([], \"Poe\")', '[]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `lines_per_author(poems)`: словарь «автор → сумма строк». Каждое стихотворение — словарь с ключами `\"author\"` и `\"lines\"`.",
     "starter": "def lines_per_author(poems):\n    # твой код\n    pass",
     "solution": "def lines_per_author(poems):\n    totals = {}\n    for p in poems:\n        totals[p[\"author\"]] = totals.get(p[\"author\"], 0) + p[\"lines\"]\n    return totals",
     "tests": [
      "lines_per_author([{\"author\": \"Poe\", \"lines\": 108}, {\"author\": \"Keats\", \"lines\": 14}, {\"author\": \"Poe\", \"lines\": 20}])",
      "lines_per_author([])"
     ],
     "hints": [
      "Начни с пустого словаря `totals = {}`.",
      "Для каждой записи прибавляй строки к сумме автора: `totals.get(автор, 0) + p[\"lines\"]`.",
      "В цикле: `totals[p[\"author\"]] = totals.get(p[\"author\"], 0) + p[\"lines\"]`, после цикла `return totals`."
     ],
     "setup": "",
     "id": "nested.10",
     "testsPy": "_TESTS = [('lines_per_author([{\"author\": \"Poe\", \"lines\": 108}, {\"author\": \"Keats\", \"lines\": 14}, {\"author\": \"Poe\", \"lines\": 20}])', \"{'Poe': 128, 'Keats': 14}\"), ('lines_per_author([])', '{}')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "functions",
   "title": "Функции",
   "diag": [
    "functions",
    "modules"
   ],
   "intro": "Функция — именованный кусок кода: `def name(params):`. `return` возвращает результат и завершает функцию. Если `return` нет, функция возвращает None. У параметра может быть значение по умолчанию.",
   "tasks": [
    {
     "type": "predict",
     "code": "def greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Emily\"))\nprint(greet(\"Edgar\", \"Hi\"))",
     "why": "Если аргумент не передан, берётся значение по умолчанию.",
     "id": "functions.1",
     "expected": "Hello, Emily!\nHi, Edgar!",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "greet",
          "функция"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "greet",
        "vars": [
         [
          "name",
          "'Emily'"
         ],
         [
          "greeting",
          "'Hello'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "greet",
        "vars": [
         [
          "name",
          "'Emily'"
         ],
         [
          "greeting",
          "'Hello'"
         ]
        ],
        "out": "",
        "ret": "'Hello, Emily!'"
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "greet",
          "функция"
         ]
        ],
        "out": "Hello, Emily!\n"
       },
       {
        "line": 1,
        "scope": "greet",
        "vars": [
         [
          "name",
          "'Edgar'"
         ],
         [
          "greeting",
          "'Hi'"
         ]
        ],
        "out": "Hello, Emily!\n"
       },
       {
        "line": 1,
        "scope": "greet",
        "vars": [
         [
          "name",
          "'Edgar'"
         ],
         [
          "greeting",
          "'Hi'"
         ]
        ],
        "out": "Hello, Emily!\n",
        "ret": "'Hi, Edgar!'"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "greet",
          "функция"
         ]
        ],
        "out": "Hello, Emily!\nHi, Edgar!\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "def double(x):\n    print(x * 2)\n\nresult = double(4)\nprint(result)",
     "why": "`print` показывает значение, а `return` возвращает его. Функция без `return` возвращает None.",
     "id": "functions.2",
     "expected": "8\nNone",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "double",
          "функция"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "double",
        "vars": [
         [
          "x",
          "4"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "double",
        "vars": [
         [
          "x",
          "4"
         ]
        ],
        "out": "8\n",
        "ret": "None"
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "double",
          "функция"
         ],
         [
          "result",
          "None"
         ]
        ],
        "out": "8\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "double",
          "функция"
         ],
         [
          "result",
          "None"
         ]
        ],
        "out": "8\nNone\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Функция должна вернуть число строк, а программа — умножить его на 10.",
     "why": "Без `return` функция возвращает None, а None нельзя умножить на число.",
     "id": "functions.3",
     "fixedLine": "    return len(text.splitlines())",
     "lines": [
      "def count_lines(text):",
      "    len(text.splitlines())",
      "",
      "print(count_lines(\"one\\ntwo\\nthree\") * 10)"
     ],
     "bugLine": 1,
     "expected": "30",
     "actual": "TypeError: unsupported operand type(s) for *: 'NoneType' and 'int'",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Функция складывает длины всех слов.",
     "why": "`return` внутри цикла завершает функцию на первом же слове. Он должен стоять после цикла.",
     "id": "functions.4",
     "fixedLine": "    return total",
     "lines": [
      "def total_length(words):",
      "    total = 0",
      "    for w in words:",
      "        total += len(w)",
      "        return total",
      "",
      "print(total_length([\"sea\", \"sky\"]))"
     ],
     "bugLine": 4,
     "expected": "6",
     "actual": "3"
    },
    {
     "type": "order",
     "task": "Функция возвращает слова длиннее трёх букв.",
     "id": "functions.5",
     "lines": [
      "def long_words(words):",
      "    result = []",
      "    for w in words:",
      "        if len(w) > 3:",
      "            result.append(w)",
      "    return result",
      "print(long_words([\"the\", \"raven\", \"said\"]))"
     ],
     "expected": "['raven', 'said']",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5,
       6
      ]
     ]
    },
    {
     "type": "order",
     "task": "Посчитать площадь прямоугольника через функцию.",
     "id": "functions.6",
     "lines": [
      "def area(width, height):",
      "    return width * height",
      "size = area(3, 4)",
      "print(size)"
     ],
     "expected": "12",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши тело функции: текст заглавными буквами и восклицательный знак в конце.",
     "why": "Функция должна вернуть результат через `return`.",
     "id": "functions.7",
     "lines": [
      "def shout(text):",
      "    ",
      "",
      "print(shout(\"nevermore\"))"
     ],
     "gapLine": 1,
     "before": "    ",
     "after": "",
     "answer": "return text.upper() + \"!\"",
     "expected": "NEVERMORE!"
    },
    {
     "type": "fill",
     "task": "Допиши аргументы, чтобы получилось «Keats (1795)».",
     "why": "Аргументы передаются в том же порядке, что и параметры.",
     "id": "functions.8",
     "lines": [
      "def describe(name, year):",
      "    return f\"{name} ({year})\"",
      "",
      "print(describe())"
     ],
     "gapLine": 3,
     "before": "print(describe(",
     "after": "))",
     "answer": "\"Keats\", 1795",
     "expected": "Keats (1795)"
    },
    {
     "type": "write",
     "task": "Напиши функцию `rhyme(a, b)`: True, если слова оканчиваются на одинаковые две буквы.",
     "starter": "def rhyme(a, b):\n    # твой код\n    pass",
     "solution": "def rhyme(a, b):\n    return a[-2:] == b[-2:]",
     "tests": [
      "rhyme(\"night\", \"light\")",
      "rhyme(\"sea\", \"sky\")",
      "rhyme(\"moon\", \"soon\")"
     ],
     "hints": [
      "Последние две буквы слова — срез `[-2:]`.",
      "Сравни срезы двух слов.",
      "`return a[-2:] == b[-2:]`"
     ],
     "setup": "",
     "id": "functions.9",
     "testsPy": "_TESTS = [('rhyme(\"night\", \"light\")', 'True'), ('rhyme(\"sea\", \"sky\")', 'False'), ('rhyme(\"moon\", \"soon\")', 'True')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `top_word(words)`: самое частое слово. Если таких несколько — то, что встретилось раньше.",
     "starter": "def top_word(words):\n    # твой код\n    pass",
     "solution": "def top_word(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    best = words[0]\n    for w in words:\n        if counts[w] > counts[best]:\n            best = w\n    return best",
     "tests": [
      "top_word([\"a\", \"b\", \"b\"])",
      "top_word([\"x\", \"y\"])",
      "top_word([\"sea\", \"sky\", \"sky\", \"sea\"])"
     ],
     "hints": [
      "Сначала посчитай слова в словарь, как в теме про словари.",
      "Потом пройди по словам по порядку и запоминай лучшее.",
      "Меняй лучшее, только если новое встречается строго чаще: так при равенстве останется то, что было раньше."
     ],
     "setup": "",
     "id": "functions.10",
     "testsPy": "_TESTS = [('top_word([\"a\", \"b\", \"b\"])', \"'b'\"), ('top_word([\"x\", \"y\"])', \"'x'\"), ('top_word([\"sea\", \"sky\", \"sky\", \"sea\"])', \"'sea'\")]\n"
    },
    {
     "type": "predict",
     "code": "def add_line(lines, line):\n    lines.append(line)\n    return len(lines)\n\npoem = [\"one\"]\nprint(add_line(poem, \"two\"), poem)",
     "why": "Список передаётся в функцию не копией: `append` внутри меняет тот же список `poem`.",
     "id": "functions.11",
     "expected": "2 ['one', 'two']",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "add_line",
          "функция"
         ]
        ],
        "out": ""
       },
       {
        "line": 5,
        "scope": "",
        "vars": [
         [
          "add_line",
          "функция"
         ],
         [
          "poem",
          "['one']"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "add_line",
        "vars": [
         [
          "lines",
          "['one']"
         ],
         [
          "line",
          "'two'"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "add_line",
        "vars": [
         [
          "lines",
          "['one', 'two']"
         ],
         [
          "line",
          "'two'"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "add_line",
        "vars": [
         [
          "lines",
          "['one', 'two']"
         ],
         [
          "line",
          "'two'"
         ]
        ],
        "out": "",
        "ret": "2"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "add_line",
          "функция"
         ],
         [
          "poem",
          "['one', 'two']"
         ]
        ],
        "out": "2 ['one', 'two']\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Описать поэта фразой «Keats was born in 1795».",
     "why": "Аргументы подставляются по порядку. Можно передать по именам: `describe(name=\"Keats\", year=1795)`.",
     "id": "functions.12",
     "fixedLine": "print(describe(\"Keats\", 1795))",
     "lines": [
      "def describe(name, year):",
      "    return f\"{name} was born in {year}\"",
      "",
      "print(describe(1795, \"Keats\"))"
     ],
     "bugLine": 3,
     "expected": "Keats was born in 1795",
     "actual": "1795 was born in Keats"
    },
    {
     "type": "order",
     "task": "Функция с параметром по умолчанию.",
     "id": "functions.13",
     "lines": [
      "def stanzas(lines, size=4):",
      "    return lines // size",
      "print(stanzas(12))",
      "print(stanzas(12, 3))"
     ],
     "expected": "3\n4",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: среднее значение списка.",
     "why": "Среднее — сумма, делённая на количество.",
     "id": "functions.14",
     "lines": [
      "def average(nums):",
      "    return ",
      "",
      "print(average([2, 4, 9]))"
     ],
     "gapLine": 1,
     "before": "    return ",
     "after": "",
     "answer": "sum(nums) / len(nums)",
     "expected": "5.0"
    },
    {
     "type": "write",
     "task": "Напиши функцию `clean_words(text)`: список слов в нижнем регистре, без знаков `.,!?;:` по краям слов.",
     "starter": "def clean_words(text):\n    # твой код\n    pass",
     "solution": "def clean_words(text):\n    return [w.strip(\".,!?;:\").lower() for w in text.split()]",
     "tests": [
      "clean_words(\"Hope, is the thing!\")",
      "clean_words(\"\")"
     ],
     "hints": [
      "Разбей текст на слова через `split()`.",
      "`strip(\".,!?;:\")` убирает эти знаки по краям слова.",
      "`return [w.strip(\".,!?;:\").lower() for w in text.split()]`"
     ],
     "setup": "",
     "id": "functions.15",
     "testsPy": "_TESTS = [('clean_words(\"Hope, is the thing!\")', \"['hope', 'is', 'the', 'thing']\"), ('clean_words(\"\")', '[]')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "sorting",
   "title": "Сортировка, key и lambda",
   "diag": [
    "functions"
   ],
   "intro": "`sorted(items)` возвращает новый отсортированный список. Параметр `key` говорит, по чему сравнивать: `key=len` — по длине. `lambda x: ...` — короткая функция в одну строку. `reverse=True` — по убыванию.",
   "tasks": [
    {
     "type": "predict",
     "code": "words = [\"sky\", \"nevermore\", \"sea\", \"moon\"]\nprint(sorted(words, key=len))",
     "why": "При равной длине порядок сохраняется: сортировка в Python устойчивая, поэтому sky стоит раньше sea.",
     "id": "sorting.1",
     "expected": "['sky', 'sea', 'moon', 'nevermore']",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sky', 'nevermore', 'sea', 'moon']"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sky', 'nevermore', 'sea', 'moon']"
         ]
        ],
        "out": "['sky', 'sea', 'moon', 'nevermore']\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "scores = {\"Keats\": 0.91, \"Poe\": 0.78, \"Blake\": 0.85}\nbest = sorted(scores, key=lambda name: scores[name], reverse=True)\nprint(best[0], best[-1])",
     "why": "Сортируем ключи словаря по значению, по убыванию: первый — лучший, последний — худший.",
     "id": "sorting.2",
     "expected": "Keats Poe",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "scores",
          "{'Keats': 0.91, 'Poe': 0.78, 'Blake': 0.85}"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Keats'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Keats'"
         ]
        ],
        "out": "",
        "ret": "0.91"
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Poe'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Poe'"
         ]
        ],
        "out": "",
        "ret": "0.78"
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Blake'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "lambda",
        "vars": [
         [
          "name",
          "'Blake'"
         ]
        ],
        "out": "",
        "ret": "0.85"
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "scores",
          "{'Keats': 0.91, 'Poe': 0.78, 'Blake': 0.85}"
         ],
         [
          "best",
          "['Keats', 'Blake', 'Poe']"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "scores",
          "{'Keats': 0.91, 'Poe': 0.78, 'Blake': 0.85}"
         ],
         [
          "best",
          "['Keats', 'Blake', 'Poe']"
         ]
        ],
        "out": "Keats Poe\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Отсортировать слова по длине.",
     "why": "В `key` передают саму функцию, без скобок: Python сам вызовет её для каждого элемента.",
     "id": "sorting.3",
     "fixedLine": "print(sorted(words, key=len))",
     "lines": [
      "words = [\"raven\", \"a\", \"sea\"]",
      "print(sorted(words, key=len()))"
     ],
     "bugLine": 1,
     "expected": "['a', 'sea', 'raven']",
     "actual": "TypeError: len() takes exactly one argument (0 given)",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Отсортировать авторов по убыванию оценки.",
     "why": "Без `reverse=True` сортировка идёт по возрастанию, и первым оказывается худший.",
     "id": "sorting.4",
     "fixedLine": "ranked = sorted(scores, key=lambda pair: pair[1], reverse=True)",
     "lines": [
      "scores = [(\"Poe\", 0.78), (\"Keats\", 0.91)]",
      "ranked = sorted(scores, key=lambda pair: pair[1])",
      "print(ranked[0][0])"
     ],
     "bugLine": 1,
     "expected": "Keats",
     "actual": "Poe"
    },
    {
     "type": "order",
     "task": "Найти два самых частых слова.",
     "id": "sorting.5",
     "lines": [
      "counts = {\"sea\": 3, \"sky\": 1, \"moon\": 5}",
      "top = sorted(counts, key=counts.get, reverse=True)",
      "print(top[:2])"
     ],
     "expected": "['moon', 'sea']",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "order",
     "task": "Отсортировать стихотворения по числу строк.",
     "id": "sorting.6",
     "lines": [
      "poems = [{\"t\": \"Raven\", \"n\": 108}, {\"t\": \"Hope\", \"n\": 12}]",
      "poems.sort(key=lambda p: p[\"n\"])",
      "names = [p[\"t\"] for p in poems]",
      "print(names)"
     ],
     "expected": "['Hope', 'Raven']",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши ключ: сортировать без учёта регистра.",
     "why": "Без ключа заглавные буквы идут раньше строчных. `str.lower` сравнивает слова в нижнем регистре.",
     "id": "sorting.7",
     "lines": [
      "words = [\"Sea\", \"apple\", \"Moon\"]",
      "print(sorted(words, key=))"
     ],
     "gapLine": 1,
     "before": "print(sorted(words, key=",
     "after": "))",
     "answer": "str.lower",
     "expected": "['apple', 'Moon', 'Sea']"
    },
    {
     "type": "fill",
     "task": "Допиши, по чему сортировать: по году.",
     "why": "Год — второй элемент пары, `p[1]`.",
     "id": "sorting.8",
     "lines": [
      "pairs = [(\"Poe\", 1809), (\"Keats\", 1795)]",
      "pairs.sort(key=lambda p: )",
      "print(pairs[0][0])"
     ],
     "gapLine": 1,
     "before": "pairs.sort(key=lambda p: ",
     "after": ")",
     "answer": "p[1]",
     "expected": "Keats"
    },
    {
     "type": "write",
     "task": "Напиши функцию `by_length(words)`: слова от самого длинного к самому короткому.",
     "starter": "def by_length(words):\n    # твой код\n    pass",
     "solution": "def by_length(words):\n    return sorted(words, key=len, reverse=True)",
     "tests": [
      "by_length([\"a\", \"ccc\", \"bb\"])",
      "by_length([])"
     ],
     "hints": [
      "Нужна `sorted` с ключом.",
      "Длина — `key=len`, по убыванию — `reverse=True`.",
      "`return sorted(words, key=len, reverse=True)`"
     ],
     "setup": "",
     "id": "sorting.9",
     "testsPy": "_TESTS = [('by_length([\"a\", \"ccc\", \"bb\"])', \"['ccc', 'bb', 'a']\"), ('by_length([])', '[]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `top_n(counts, n)`: `n` самых частых слов из словаря «слово → число», по убыванию.",
     "starter": "def top_n(counts, n):\n    # твой код\n    pass",
     "solution": "def top_n(counts, n):\n    return sorted(counts, key=counts.get, reverse=True)[:n]",
     "tests": [
      "top_n({\"a\": 1, \"b\": 3, \"c\": 2}, 2)",
      "top_n({\"x\": 1}, 5)"
     ],
     "hints": [
      "Отсортируй ключи словаря по значению: `key=counts.get`.",
      "По убыванию — `reverse=True`, первые `n` — срез `[:n]`.",
      "`return sorted(counts, key=counts.get, reverse=True)[:n]`"
     ],
     "setup": "",
     "id": "sorting.10",
     "testsPy": "_TESTS = [('top_n({\"a\": 1, \"b\": 3, \"c\": 2}, 2)', \"['b', 'c']\"), ('top_n({\"x\": 1}, 5)', \"['x']\")]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "comprehensions",
   "title": "Генераторы списков",
   "diag": [
    "comprehensions"
   ],
   "intro": "Генератор списка собирает новый список в одну строку: `[выражение for x in список if условие]`. Так же собирают словари: `{ключ: значение for x in список}`.",
   "tasks": [
    {
     "type": "predict",
     "code": "words = [\"sea\", \"moon\", \"stars\"]\nprint([len(w) for w in words])",
     "why": "Выражение слева применяется к каждому элементу.",
     "id": "comprehensions.1",
     "expected": "[3, 4, 5]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sea', 'moon', 'stars']"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'moon'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'stars'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sea', 'moon', 'stars']"
         ]
        ],
        "out": "[3, 4, 5]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "words = [\"the\", \"raven\", \"a\", \"door\"]\nprint([w.upper() for w in words if len(w) > 3])",
     "why": "Условие справа отбирает элементы, выражение слева их меняет.",
     "id": "comprehensions.2",
     "expected": "['RAVEN', 'DOOR']",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "words",
          "['the', 'raven', 'a', 'door']"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'the'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'raven'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'a'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'door'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "words",
          "['the', 'raven', 'a', 'door']"
         ]
        ],
        "out": "['RAVEN', 'DOOR']\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Квадраты чисел от 1 до 3.",
     "why": "`range(3)` начинается с нуля: 0, 1, 2.",
     "id": "comprehensions.3",
     "fixedLine": "nums = range(1, 4)",
     "lines": [
      "nums = range(3)",
      "squares = [n * n for n in nums]",
      "print(squares)"
     ],
     "bugLine": 0,
     "expected": "[1, 4, 9]",
     "actual": "[0, 1, 4]"
    },
    {
     "type": "bug",
     "task": "Словарь «слово → длина».",
     "why": "В словарном генераторе слева от двоеточия ключ, справа значение.",
     "id": "comprehensions.4",
     "fixedLine": "lengths = {w: len(w) for w in words}",
     "lines": [
      "words = [\"sea\", \"moon\"]",
      "lengths = {len(w): w for w in words}",
      "print(lengths)"
     ],
     "bugLine": 1,
     "expected": "{'sea': 3, 'moon': 4}",
     "actual": "{3: 'sea', 4: 'moon'}"
    },
    {
     "type": "order",
     "task": "Привести слова к нижнему регистру и оставить короткие.",
     "id": "comprehensions.5",
     "lines": [
      "words = [\"Hope\", \"is\", \"the\", \"thing\"]",
      "lower = [w.lower() for w in words]",
      "short = [w for w in lower if len(w) <= 3]",
      "print(short)"
     ],
     "expected": "['is', 'the']",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Оставить стихотворения длиннее 20 строк.",
     "id": "comprehensions.6",
     "lines": [
      "poems = {\"Raven\": 108, \"Hope\": 12, \"Daffodils\": 24}",
      "long = [name for name, n in poems.items() if n > 20]",
      "print(long)"
     ],
     "expected": "['Raven', 'Daffodils']",
     "valid": [
      [
       0,
       1,
       2
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: первая буква каждого слова.",
     "why": "Первая буква — `w[0]`.",
     "id": "comprehensions.7",
     "lines": [
      "words = [\"sea\", \"moon\", \"stars\"]",
      "print([ for w in words])"
     ],
     "gapLine": 1,
     "before": "print([",
     "after": " for w in words])",
     "answer": "w[0]",
     "expected": "['s', 'm', 's']"
    },
    {
     "type": "fill",
     "task": "Допиши условие: только чётные числа.",
     "why": "Чётное число делится на 2 без остатка: `n % 2 == 0`.",
     "id": "comprehensions.8",
     "lines": [
      "nums = [1, 2, 3, 4, 5, 6]",
      "print([n for n in nums ])"
     ],
     "gapLine": 1,
     "before": "print([n for n in nums ",
     "after": "])",
     "answer": "if n % 2 == 0",
     "expected": "[2, 4, 6]"
    },
    {
     "type": "write",
     "task": "Напиши функцию `lengths(words)`: список длин слов. Попробуй одной строкой через генератор.",
     "starter": "def lengths(words):\n    # твой код\n    pass",
     "solution": "def lengths(words):\n    return [len(w) for w in words]",
     "tests": [
      "lengths([\"a\", \"bb\"])",
      "lengths([])"
     ],
     "hints": [
      "Шаблон: `[выражение for w in words]`.",
      "Выражение здесь — `len(w)`.",
      "`return [len(w) for w in words]`"
     ],
     "setup": "",
     "id": "comprehensions.9",
     "testsPy": "_TESTS = [('lengths([\"a\", \"bb\"])', '[1, 2]'), ('lengths([])', '[]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `capitalized(words)`: только слова, которые начинаются с заглавной буквы.",
     "starter": "def capitalized(words):\n    # твой код\n    pass",
     "solution": "def capitalized(words):\n    return [w for w in words if w[:1].isupper()]",
     "tests": [
      "capitalized([\"Hope\", \"is\", \"The\"])",
      "capitalized([\"a\"])",
      "capitalized([\"\", \"Sea\"])"
     ],
     "hints": [
      "Нужен генератор с условием `if`.",
      "Проверить заглавную букву помогает метод `isupper()`.",
      "Для пустой строки `w[0]` даст ошибку, а `w[:1]` — нет: `[w for w in words if w[:1].isupper()]`."
     ],
     "setup": "",
     "id": "comprehensions.10",
     "testsPy": "_TESTS = [('capitalized([\"Hope\", \"is\", \"The\"])', \"['Hope', 'The']\"), ('capitalized([\"a\"])', '[]'), ('capitalized([\"\", \"Sea\"])', \"['Sea']\")]\n"
    },
    {
     "type": "predict",
     "code": "words = [\"sea\", \"sky\", \"sea\"]\nprint(sorted({w for w in words}), {w: len(w) for w in words})",
     "why": "Генератор множества в фигурных скобках убирает повторы, словарный — собирает пары.",
     "id": "comprehensions.11",
     "expected": "['sea', 'sky'] {'sea': 3, 'sky': 3}",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sea', 'sky', 'sea']"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sky'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sky'"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "w",
          "'sea'"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "words",
          "['sea', 'sky', 'sea']"
         ]
        ],
        "out": "['sea', 'sky'] {'sea': 3, 'sky': 3}\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Оставить только непустые строки.",
     "why": "Пустая строка — ложь, поэтому `if l` оставляет непустые, а `if not l` — пустые.",
     "id": "comprehensions.12",
     "fixedLine": "kept = [l for l in lines if l]",
     "lines": [
      "lines = [\"Hope\", \"\", \"is\", \"\"]",
      "kept = [l for l in lines if not l]",
      "print(kept)"
     ],
     "bugLine": 1,
     "expected": "['Hope', 'is']",
     "actual": "['', '']"
    },
    {
     "type": "order",
     "task": "Посчитать длины слов, в которых есть буква e.",
     "id": "comprehensions.13",
     "lines": [
      "words = [\"sea\", \"sky\", \"tree\"]",
      "lens = [len(w) for w in words if \"e\" in w]",
      "total = sum(lens)",
      "print(lens, total)"
     ],
     "expected": "[3, 4] 7",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши выражение: каждое число умножить на 10.",
     "why": "Слева в генераторе — что сделать с каждым элементом.",
     "id": "comprehensions.14",
     "lines": [
      "nums = [1, 2, 3]",
      "print([ for n in nums])"
     ],
     "gapLine": 1,
     "before": "print([",
     "after": " for n in nums])",
     "answer": "n * 10",
     "expected": "[10, 20, 30]"
    },
    {
     "type": "write",
     "task": "Напиши функцию `word_lengths(words)`: словарь «слово → длина», одной строкой.",
     "starter": "def word_lengths(words):\n    # твой код\n    pass",
     "solution": "def word_lengths(words):\n    return {w: len(w) for w in words}",
     "tests": [
      "word_lengths([\"sea\", \"moon\"])",
      "word_lengths([])"
     ],
     "hints": [
      "Словарный генератор пишут в фигурных скобках.",
      "Слева от двоеточия ключ, справа значение.",
      "`return {w: len(w) for w in words}`"
     ],
     "setup": "",
     "id": "comprehensions.15",
     "testsPy": "_TESTS = [('word_lengths([\"sea\", \"moon\"])', \"{'sea': 3, 'moon': 4}\"), ('word_lengths([])', '{}')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "errors",
   "title": "Ошибки и исключения",
   "diag": [
    "errors"
   ],
   "intro": "`try` выполняет код, а `except Тип:` ловит ошибку этого типа. Ловить нужно ту ошибку, которая действительно возникает. `raise` сообщает об ошибке сам. Подробнее о типичных ошибках — в разборе ошибок.",
   "tasks": [
    {
     "type": "predict",
     "code": "try:\n    n = int(\"fourteen\")\nexcept ValueError:\n    n = 0\nprint(n)",
     "why": "`int(\"fourteen\")` даёт ValueError, поэтому выполняется ветка `except`.",
     "id": "errors.1",
     "expected": "0",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "n",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "n",
          "0"
         ]
        ],
        "out": "0\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "def safe_div(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n\nprint(safe_div(6, 3), safe_div(1, 0))",
     "why": "Делить на ноль нельзя: вторая попытка попадает в `except`.",
     "id": "errors.2",
     "expected": "2.0 None",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 6,
        "scope": "",
        "vars": [
         [
          "safe_div",
          "функция"
         ]
        ],
        "out": ""
       },
       {
        "line": 1,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "6"
         ],
         [
          "b",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "6"
         ],
         [
          "b",
          "3"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "6"
         ],
         [
          "b",
          "3"
         ]
        ],
        "out": "",
        "ret": "2.0"
       },
       {
        "line": 1,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "1"
         ],
         [
          "b",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "1"
         ],
         [
          "b",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "1"
         ],
         [
          "b",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "safe_div",
        "vars": [
         [
          "a",
          "1"
         ],
         [
          "b",
          "0"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "safe_div",
          "функция"
         ]
        ],
        "out": "2.0 None\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Если стихотворения нет в словаре, напечатать «unknown».",
     "why": "В словаре нет ключа — это KeyError. IndexError бывает у списков, поэтому ошибка не поймана.",
     "id": "errors.3",
     "fixedLine": "except KeyError:",
     "lines": [
      "authors = {\"Raven\": \"Poe\"}",
      "try:",
      "    print(authors[\"Hope\"])",
      "except IndexError:",
      "    print(\"unknown\")"
     ],
     "bugLine": 3,
     "expected": "unknown",
     "actual": "KeyError: 'Hope'",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Превратить строки в числа, пропуская неправильные.",
     "why": "`int(\"x\")` даёт ValueError, а не TypeError, поэтому ошибка не поймана.",
     "id": "errors.4",
     "fixedLine": "    except ValueError:",
     "lines": [
      "values = [\"14\", \"x\", \"3\"]",
      "nums = []",
      "for v in values:",
      "    try:",
      "        nums.append(int(v))",
      "    except TypeError:",
      "        pass",
      "print(nums)"
     ],
     "bugLine": 5,
     "expected": "[14, 3]",
     "actual": "ValueError: invalid literal for int() with base 10: 'x'",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Превратить текст в число, а если не выходит — в None.",
     "id": "errors.5",
     "lines": [
      "text = \"12 lines\"",
      "try:",
      "    n = int(text)",
      "except ValueError:",
      "    n = None",
      "print(n)"
     ],
     "expected": "None",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       0,
       1,
       4,
       3,
       2,
       5
      ],
      [
       1,
       4,
       3,
       2,
       0,
       5
      ],
      [
       1,
       4,
       3,
       2,
       5,
       0
      ]
     ]
    },
    {
     "type": "order",
     "task": "Функция сообщает об ошибке, если строк меньше одной.",
     "id": "errors.6",
     "lines": [
      "def check_lines(n):",
      "    if n <= 0:",
      "        raise ValueError(\"lines must be positive\")",
      "    return n",
      "print(check_lines(14))"
     ],
     "expected": "14",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ],
      [
       0,
       3,
       1,
       2,
       4
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши тип ошибки, которая возникает при номере за пределами списка.",
     "why": "Номер за пределами списка — IndexError.",
     "id": "errors.7",
     "lines": [
      "try:",
      "    x = [1, 2, 3][5]",
      "except :",
      "    x = -1",
      "print(x)"
     ],
     "gapLine": 2,
     "before": "except ",
     "after": ":",
     "answer": "IndexError",
     "expected": "-1"
    },
    {
     "type": "fill",
     "task": "Допиши строку: если год не число, функция возвращает 0.",
     "why": "Ветка `except` выполняется, когда `int()` не смог превратить текст в число.",
     "id": "errors.8",
     "lines": [
      "def parse_year(text):",
      "    try:",
      "        return int(text)",
      "    except ValueError:",
      "        ",
      "",
      "print(parse_year(\"1819\"), parse_year(\"unknown\"))"
     ],
     "gapLine": 4,
     "before": "        ",
     "after": "",
     "answer": "return 0",
     "expected": "1819 0"
    },
    {
     "type": "write",
     "task": "Напиши функцию `to_int(text)`: число из строки или None, если превратить не получается.",
     "starter": "def to_int(text):\n    # твой код\n    pass",
     "solution": "def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None",
     "tests": [
      "to_int(\"14\")",
      "to_int(\"x\")",
      "to_int(\"-3\")"
     ],
     "hints": [
      "Оберни `int(text)` в `try`.",
      "Неправильная строка даёт ValueError.",
      "В `except ValueError:` верни `None`."
     ],
     "setup": "",
     "id": "errors.9",
     "testsPy": "_TESTS = [('to_int(\"14\")', '14'), ('to_int(\"x\")', 'None'), ('to_int(\"-3\")', '-3')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `safe_get(items, i)`: элемент с номером `i` или None, если такого номера нет.",
     "starter": "def safe_get(items, i):\n    # твой код\n    pass",
     "solution": "def safe_get(items, i):\n    try:\n        return items[i]\n    except IndexError:\n        return None",
     "tests": [
      "safe_get([1, 2], 1)",
      "safe_get([1, 2], 5)",
      "safe_get([], 0)"
     ],
     "hints": [
      "Обращение по номеру за пределами списка даёт IndexError.",
      "Поймай её через `try` / `except IndexError:`.",
      "В `except` верни `None`."
     ],
     "setup": "",
     "id": "errors.10",
     "testsPy": "_TESTS = [('safe_get([1, 2], 1)', '2'), ('safe_get([1, 2], 5)', 'None'), ('safe_get([], 0)', 'None')]\n"
    },
    {
     "type": "predict",
     "code": "try:\n    print(\"start\")\n    x = 1 / 0\n    print(\"never\")\nexcept ZeroDivisionError:\n    print(\"caught\")\nfinally:\n    print(\"done\")",
     "why": "После ошибки остаток блока `try` пропускается. `finally` выполняется всегда.",
     "id": "errors.11",
     "expected": "start\ncaught\ndone",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [],
        "out": "start\n"
       },
       {
        "line": 4,
        "scope": "",
        "vars": [],
        "out": "start\n"
       },
       {
        "line": 5,
        "scope": "",
        "vars": [],
        "out": "start\n"
       },
       {
        "line": 7,
        "scope": "",
        "vars": [],
        "out": "start\ncaught\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [],
        "out": "start\ncaught\ndone\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Поймать ошибку деления и напечатать её текст.",
     "why": "Чтобы получить саму ошибку в переменную, нужно слово `as`: `except ZeroDivisionError as e:`.",
     "id": "errors.12",
     "fixedLine": "except ZeroDivisionError as e:",
     "lines": [
      "try:",
      "    ratio = 10 / 0",
      "except ZeroDivisionError e:",
      "    print(\"error:\", e)"
     ],
     "bugLine": 2,
     "expected": "error: division by zero",
     "actual": "SyntaxError: invalid syntax",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Функция проверяет число строк и сообщает об ошибке.",
     "id": "errors.13",
     "lines": [
      "def parse_lines(text):",
      "    n = int(text)",
      "    if n < 0:",
      "        raise ValueError(\"negative\")",
      "    return n",
      "print(parse_lines(\"14\"))"
     ],
     "expected": "14",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       0,
       1,
       4,
       2,
       3,
       5
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, чтобы получить текст ошибки в переменную.",
     "why": "`as e` кладёт пойманную ошибку в переменную `e`.",
     "id": "errors.14",
     "lines": [
      "try:",
      "    value = int(\"x\")",
      "except ValueError :",
      "    print(\"bad:\", e)"
     ],
     "gapLine": 2,
     "before": "except ValueError ",
     "after": ":",
     "answer": "as e",
     "expected": "bad: invalid literal for int() with base 10: 'x'"
    },
    {
     "type": "write",
     "task": "Напиши функцию `safe_ratio(a, b)`: `a / b`, округлённое до двух знаков, или 0, если `b` равно нулю.",
     "starter": "def safe_ratio(a, b):\n    # твой код\n    pass",
     "solution": "def safe_ratio(a, b):\n    try:\n        return round(a / b, 2)\n    except ZeroDivisionError:\n        return 0",
     "tests": [
      "safe_ratio(1, 4)",
      "safe_ratio(1, 0)",
      "safe_ratio(2, 3)"
     ],
     "hints": [
      "Деление на ноль даёт ZeroDivisionError.",
      "Оберни деление в `try`, в `except ZeroDivisionError:` верни 0.",
      "В `try`: `return round(a / b, 2)`."
     ],
     "setup": "",
     "id": "errors.15",
     "testsPy": "_TESTS = [('safe_ratio(1, 4)', '0.25'), ('safe_ratio(1, 0)', '0'), ('safe_ratio(2, 3)', '0.67')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "classes",
   "title": "Классы и файлы",
   "diag": [
    "classes",
    "files"
   ],
   "intro": "Класс описывает объект: данные в `self` и методы. Первый параметр метода — `self`. Файлы открывают через `with open(путь, режим, encoding=\"utf-8\")`: \"w\" — записать, без режима — прочитать.",
   "tasks": [
    {
     "type": "predict",
     "code": "class Poem:\n    def __init__(self, title, lines):\n        self.title = title\n        self.lines = lines\n\n    def size(self):\n        return len(self.lines)\n\np = Poem(\"Hope\", [\"Hope is the thing\", \"with feathers\"])\nprint(p.title, p.size())",
     "why": "`__init__` сохраняет данные в объект, метод `size` читает их через `self`.",
     "id": "classes.1",
     "expected": "Hope 2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 8,
        "scope": "",
        "vars": [
         [
          "Poem",
          "класс"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "__init__",
        "vars": [
         [
          "self",
          "Poem()"
         ],
         [
          "title",
          "'Hope'"
         ],
         [
          "lines",
          "['Hope is the thing', 'with feathers']"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "__init__",
        "vars": [
         [
          "self",
          "Poem(title='Hope')"
         ],
         [
          "title",
          "'Hope'"
         ],
         [
          "lines",
          "['Hope is the thing', 'with feathers']"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "__init__",
        "vars": [
         [
          "self",
          "Poem(title='Hope', lines=['Hope is the thing', 'with feat..."
         ],
         [
          "title",
          "'Hope'"
         ],
         [
          "lines",
          "['Hope is the thing', 'with feathers']"
         ]
        ],
        "out": "",
        "ret": "None"
       },
       {
        "line": 9,
        "scope": "",
        "vars": [
         [
          "Poem",
          "класс"
         ],
         [
          "p",
          "Poem(title='Hope', lines=['Hope is the thing', 'with feat..."
         ]
        ],
        "out": ""
       },
       {
        "line": 6,
        "scope": "size",
        "vars": [
         [
          "self",
          "Poem(title='Hope', lines=['Hope is the thing', 'with feat..."
         ]
        ],
        "out": ""
       },
       {
        "line": 6,
        "scope": "size",
        "vars": [
         [
          "self",
          "Poem(title='Hope', lines=['Hope is the thing', 'with feat..."
         ]
        ],
        "out": "",
        "ret": "2"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "Poem",
          "класс"
         ],
         [
          "p",
          "Poem(title='Hope', lines=['Hope is the thing', 'with feat..."
         ]
        ],
        "out": "Hope 2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "with open(\"note.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"line one\\nline two\\n\")\n\nwith open(\"note.txt\", encoding=\"utf-8\") as f:\n    print(len(f.readlines()))",
     "why": "`readlines()` возвращает список строк файла.",
     "id": "classes.2",
     "expected": "2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='w' encoding='utf..."
         ]
        ],
        "out": ""
       },
       {
        "line": 0,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='w' encoding='utf..."
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='w' encoding='utf..."
         ]
        ],
        "out": ""
       },
       {
        "line": 4,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='r' encoding='utf..."
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='r' encoding='utf..."
         ]
        ],
        "out": "2\n"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "f",
          "<_io.TextIOWrapper name='note.txt' mode='r' encoding='utf..."
         ]
        ],
        "out": "2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Метод должен вернуть название заглавными буквами.",
     "why": "Первый параметр метода — `self`: Python сам передаёт в него объект.",
     "id": "classes.3",
     "fixedLine": "    def loud(self):",
     "lines": [
      "class Poem:",
      "    def __init__(self, title):",
      "        self.title = title",
      "",
      "    def loud():",
      "        return self.title.upper()",
      "",
      "print(Poem(\"Raven\").loud())"
     ],
     "bugLine": 4,
     "expected": "RAVEN",
     "actual": "TypeError: Poem.loud() takes 0 positional arguments but 1 was given",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Записать строку в файл и прочитать её.",
     "why": "Режим \"r\" — только чтение, а файла ещё нет. Чтобы записать, нужен режим \"w\".",
     "id": "classes.4",
     "fixedLine": "with open(\"out.txt\", \"w\", encoding=\"utf-8\") as f:",
     "lines": [
      "with open(\"out.txt\", \"r\", encoding=\"utf-8\") as f:",
      "    f.write(\"Nevermore\")",
      "",
      "with open(\"out.txt\", encoding=\"utf-8\") as f:",
      "    print(f.read())"
     ],
     "bugLine": 0,
     "expected": "Nevermore",
     "actual": "FileNotFoundError: [Errno 2] No such file or directory: 'out.txt'",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Класс поэта с методом подписи.",
     "id": "classes.5",
     "lines": [
      "class Poet:",
      "    def __init__(self, name):",
      "        self.name = name",
      "    def sign(self):",
      "        return \"— \" + self.name",
      "print(Poet(\"Keats\").sign())"
     ],
     "expected": "— Keats",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ],
      [
       0,
       3,
       4,
       1,
       2,
       5
      ]
     ]
    },
    {
     "type": "order",
     "task": "Записать две строки в файл и прочитать вторую.",
     "id": "classes.6",
     "lines": [
      "lines = [\"Tyger Tyger\", \"burning bright\"]",
      "with open(\"tyger.txt\", \"w\", encoding=\"utf-8\") as f:",
      "    f.write(\"\\n\".join(lines))",
      "with open(\"tyger.txt\", encoding=\"utf-8\") as f:",
      "    print(f.read().split(\"\\n\")[1])"
     ],
     "expected": "burning bright",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши строку в `__init__`, которая сохраняет название.",
     "why": "Данные объекта хранятся в `self`.",
     "id": "classes.7",
     "lines": [
      "class Poem:",
      "    def __init__(self, title):",
      "        ",
      "",
      "print(Poem(\"Ozymandias\").title)"
     ],
     "gapLine": 2,
     "before": "        ",
     "after": "",
     "answer": "self.title = title",
     "expected": "Ozymandias"
    },
    {
     "type": "fill",
     "task": "Допиши: прочитать файл и разбить его на слова.",
     "why": "`read()` возвращает весь текст, `split()` режет его по пробелам и переносам строк.",
     "id": "classes.8",
     "lines": [
      "with open(\"words.txt\", \"w\", encoding=\"utf-8\") as f:",
      "    f.write(\"sea\\nsky\\n\")",
      "",
      "with open(\"words.txt\", encoding=\"utf-8\") as f:",
      "    words = ",
      "print(words)"
     ],
     "gapLine": 4,
     "before": "    words = ",
     "after": "",
     "answer": "f.read().split()",
     "expected": "['sea', 'sky']"
    },
    {
     "type": "write",
     "task": "Допиши метод `word_count()`: сколько слов во всех строках стихотворения.",
     "starter": "class Poem:\n    def __init__(self, title, lines):\n        self.title = title\n        self.lines = lines\n\n    def word_count(self):\n        # твой код\n        pass",
     "solution": "class Poem:\n    def __init__(self, title, lines):\n        self.title = title\n        self.lines = lines\n\n    def word_count(self):\n        total = 0\n        for line in self.lines:\n            total += len(line.split())\n        return total",
     "tests": [
      "Poem(\"A\", [\"a b\", \"c\"]).word_count()",
      "Poem(\"B\", []).word_count()"
     ],
     "hints": [
      "Строки лежат в `self.lines`.",
      "Для каждой строки прибавляй `len(line.split())`.",
      "Начни с `total = 0`, после цикла `return total`."
     ],
     "setup": "",
     "id": "classes.9",
     "testsPy": "_TESTS = [('Poem(\"A\", [\"a b\", \"c\"]).word_count()', '3'), ('Poem(\"B\", []).word_count()', '0')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `count_lines(path)`: сколько непустых строк в файле.",
     "starter": "def count_lines(path):\n    # твой код\n    pass",
     "solution": "def count_lines(path):\n    with open(path, encoding=\"utf-8\") as f:\n        return len([line for line in f if line.strip()])",
     "tests": [
      "count_lines(\"poem1.txt\")",
      "count_lines(\"poem2.txt\")"
     ],
     "hints": [
      "Открой файл: `with open(path, encoding=\"utf-8\") as f:`.",
      "Строка пустая, если `line.strip()` даёт пустую строку.",
      "`return len([line for line in f if line.strip()])`"
     ],
     "setup": "with open(\"poem1.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hope is the thing\\n\\nwith feathers\\n\")\nwith open(\"poem2.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"one\\ntwo\\nthree\")",
     "id": "classes.10",
     "testsPy": "_TESTS = [('count_lines(\"poem1.txt\")', '2'), ('count_lines(\"poem2.txt\")', '3')]\n"
    },
    {
     "type": "predict",
     "code": "class Poem:\n    def __init__(self, title):\n        self.title = title\n\n    def __str__(self):\n        return f\"«{self.title}»\"\n\nprint(Poem(\"Hope\"))",
     "why": "`__str__` определяет, как объект выглядит в `print`.",
     "id": "classes.11",
     "expected": "«Hope»",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 7,
        "scope": "",
        "vars": [
         [
          "Poem",
          "класс"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "__init__",
        "vars": [
         [
          "self",
          "Poem()"
         ],
         [
          "title",
          "'Hope'"
         ]
        ],
        "out": ""
       },
       {
        "line": 2,
        "scope": "__init__",
        "vars": [
         [
          "self",
          "Poem(title='Hope')"
         ],
         [
          "title",
          "'Hope'"
         ]
        ],
        "out": "",
        "ret": "None"
       },
       {
        "line": 5,
        "scope": "__str__",
        "vars": [
         [
          "self",
          "Poem(title='Hope')"
         ]
        ],
        "out": ""
       },
       {
        "line": 5,
        "scope": "__str__",
        "vars": [
         [
          "self",
          "Poem(title='Hope')"
         ]
        ],
        "out": "",
        "ret": "'«Hope»'"
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "Poem",
          "класс"
         ]
        ],
        "out": "«Hope»\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Создать два стихотворения с разными названиями.",
     "why": "Без `self.` значение остаётся локальной переменной и пропадает после `__init__`.",
     "id": "classes.12",
     "fixedLine": "        self.title = title",
     "lines": [
      "class Poem:",
      "    def __init__(self, title):",
      "        title = title",
      "",
      "a = Poem(\"Hope\")",
      "b = Poem(\"Raven\")",
      "print(a.title, b.title)"
     ],
     "bugLine": 2,
     "expected": "Hope Raven",
     "actual": "AttributeError: 'Poem' object has no attribute 'title'",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Записать строку, дописать вторую и прочитать файл.",
     "id": "classes.13",
     "lines": [
      "with open(\"log.txt\", \"w\", encoding=\"utf-8\") as f:",
      "    f.write(\"one\\n\")",
      "with open(\"log.txt\", \"a\", encoding=\"utf-8\") as f:",
      "    f.write(\"two\\n\")",
      "with open(\"log.txt\", encoding=\"utf-8\") as f:",
      "    print(f.read().split())"
     ],
     "expected": "['one', 'two']",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4,
       5
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши метод: вернуть первую строку стихотворения.",
     "why": "Строки лежат в `self.lines`, первая — `[0]`.",
     "id": "classes.14",
     "lines": [
      "class Poem:",
      "    def __init__(self, lines):",
      "        self.lines = lines",
      "",
      "    def first(self):",
      "        return ",
      "",
      "print(Poem([\"Tyger Tyger\", \"burning bright\"]).first())"
     ],
     "gapLine": 5,
     "before": "        return ",
     "after": "",
     "answer": "self.lines[0]",
     "expected": "Tyger Tyger"
    },
    {
     "type": "write",
     "task": "Допиши класс `Library`: `add(title)` добавляет название в `self.titles`, `count()` возвращает число названий. Проверка добавит два названия и вызовет `count()`.",
     "starter": "class Library:\n    def __init__(self):\n        self.titles = []\n\n    def add(self, title):\n        # твой код\n        pass\n\n    def count(self):\n        # твой код\n        pass",
     "solution": "class Library:\n    def __init__(self):\n        self.titles = []\n\n    def add(self, title):\n        self.titles.append(title)\n\n    def count(self):\n        return len(self.titles)",
     "tests": [
      "add_two_and_count()",
      "Library().count()"
     ],
     "hints": [
      "Названия хранятся в списке `self.titles`.",
      "В `add`: `self.titles.append(title)`.",
      "В `count`: `return len(self.titles)`."
     ],
     "setup": "def add_two_and_count():\n    lib = Library()\n    lib.add(\"Hope\")\n    lib.add(\"Raven\")\n    return lib.count()",
     "id": "classes.15",
     "testsPy": "_TESTS = [('add_two_and_count()', '2'), ('Library().count()', '0')]\n"
    }
   ],
   "track": "py"
  },
  {
   "id": "np_arrays",
   "title": "NumPy: массивы",
   "diag": [],
   "intro": "Массив NumPy — набор чисел, с которым действия идут сразу над всеми элементами: `a * 2` умножает каждый. Создают из списка: `np.array([1, 2, 3])`. `a.shape` — размеры, `np.arange(n)` — числа от 0 до n−1, `a.tolist()` — обратно в обычный список. На массивах держатся pandas, scikit-learn и PyTorch.",
   "tasks": [
    {
     "type": "predict",
     "code": "import numpy as np\na = np.array([1, 2, 3])\nprint(a * 2, a + a)",
     "why": "Действие применяется к каждому элементу. Со списком `[1, 2, 3] * 2` получился бы список, повторённый дважды.",
     "id": "np_arrays.1",
     "expected": "[2 4 6] [2 4 6]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 3: [1, 2, 3]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 3: [1, 2, 3]"
         ]
        ],
        "out": "[2 4 6] [2 4 6]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m.shape, len(m), m.size)",
     "why": "`shape` — (строк, столбцов), `len` — число строк, `size` — сколько всего чисел.",
     "id": "np_arrays.2",
     "expected": "(2, 3) 2 6",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×3: [[1, 2, 3], [4, 5, 6]]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×3: [[1, 2, 3], [4, 5, 6]]"
         ]
        ],
        "out": "(2, 3) 2 6\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Удвоить длину каждого стихотворения.",
     "why": "Обычный список при умножении на 2 повторяется. Чтобы умножить каждое число, нужен массив `np.array`.",
     "id": "np_arrays.3",
     "fixedLine": "lengths = np.array([14, 8, 20])",
     "lines": [
      "import numpy as np",
      "lengths = [14, 8, 20]",
      "print(lengths * 2)"
     ],
     "bugLine": 1,
     "expected": "[28 16 40]",
     "actual": "[14, 8, 20, 14, 8, 20]"
    },
    {
     "type": "bug",
     "task": "Получить числа от 0 до 4.",
     "why": "`np.arange` работает как `range`: по умолчанию начинает с 0 и не включает конец.",
     "id": "np_arrays.4",
     "fixedLine": "a = np.arange(5)",
     "lines": [
      "import numpy as np",
      "a = np.arange(1, 5)",
      "print(a.tolist())"
     ],
     "bugLine": 1,
     "expected": "[0, 1, 2, 3, 4]",
     "actual": "[1, 2, 3, 4]"
    },
    {
     "type": "order",
     "task": "Перевести доли в проценты с одним знаком.",
     "id": "np_arrays.5",
     "lines": [
      "import numpy as np",
      "scores = np.array([0.912, 0.784])",
      "pct = np.round(scores * 100, 1)",
      "print(pct.tolist())"
     ],
     "expected": "[91.2, 78.4]",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Завести счётчики-нули и записать первый.",
     "id": "np_arrays.6",
     "lines": [
      "import numpy as np",
      "counts = np.zeros(3, dtype=int)",
      "counts[0] = 5",
      "print(counts.tolist(), counts.shape)"
     ],
     "expected": "[5, 0, 0] (3,)",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: создай массив из списка.",
     "why": "Массив из списка создаёт `np.array(список)`.",
     "id": "np_arrays.7",
     "lines": [
      "import numpy as np",
      "a = ([3, 1, 2])",
      "print(a * 10)"
     ],
     "gapLine": 1,
     "before": "a = ",
     "after": "([3, 1, 2])",
     "answer": "np.array",
     "expected": "[30 10 20]"
    },
    {
     "type": "fill",
     "task": "Допиши: размеры таблицы.",
     "why": "`shape` — кортеж (строк, столбцов).",
     "id": "np_arrays.8",
     "lines": [
      "import numpy as np",
      "m = np.array([[1, 2], [3, 4], [5, 6]])",
      "print(m)"
     ],
     "gapLine": 2,
     "before": "print(m",
     "after": ")",
     "answer": ".shape",
     "expected": "(3, 2)"
    },
    {
     "type": "write",
     "task": "Напиши функцию `normalize(values)`: каждое число делится на максимум, результат — обычный список.",
     "starter": "import numpy as np\n\n\ndef normalize(values):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef normalize(values):\n    a = np.array(values)\n    return (a / a.max()).tolist()",
     "tests": [
      "normalize([1, 2, 4])",
      "normalize([5])"
     ],
     "hints": [
      "Сделай массив: `a = np.array(values)`.",
      "Деление массива на число делит каждый элемент: `a / a.max()`.",
      "`return (a / a.max()).tolist()`"
     ],
     "setup": "",
     "id": "np_arrays.9",
     "testsPy": "_TESTS = [('normalize([1, 2, 4])', '[0.25, 0.5, 1.0]'), ('normalize([5])', '[1.0]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `to_percent(shares)`: доли в проценты с одним знаком после точки, обычным списком.",
     "starter": "import numpy as np\n\n\ndef to_percent(shares):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef to_percent(shares):\n    return np.round(np.array(shares) * 100, 1).tolist()",
     "tests": [
      "to_percent([0.5, 0.123])",
      "to_percent([])"
     ],
     "hints": [
      "Сделай массив и умножь на 100.",
      "Округлить все элементы: `np.round(массив, 1)`.",
      "`return np.round(np.array(shares) * 100, 1).tolist()`"
     ],
     "setup": "",
     "id": "np_arrays.10",
     "testsPy": "_TESTS = [('to_percent([0.5, 0.123])', '[50.0, 12.3]'), ('to_percent([])', '[]')]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "np_index",
   "title": "NumPy: индексы и маски",
   "diag": [],
   "intro": "Индексы и срезы — как у списков: `a[0]`, `a[-2:]`. Маска — массив из True и False: `a > 10`. `a[a > 10]` оставляет только подходящие элементы. Два условия соединяют `&` и берут каждое в скобки. В таблице `m[строка, столбец]`, а `m[:, 0]` — весь первый столбец.",
   "tasks": [
    {
     "type": "predict",
     "code": "import numpy as np\na = np.array([5, 12, 8, 20])\nprint(a[a > 10], (a > 10).sum())",
     "why": "Маска оставляет элементы, где True. При сложении True считается как 1, поэтому сумма маски — число подходящих.",
     "id": "np_index.1",
     "expected": "[12 20] 2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 4: [5, 12, 8, 20]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 4: [5, 12, 8, 20]"
         ]
        ],
        "out": "[12 20] 2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import numpy as np\nm = np.array([[1, 2, 3], [4, 5, 6]])\nprint(m[1, 2], m[:, 0], m[0])",
     "why": "`m[1, 2]` — строка 1, столбец 2. `m[:, 0]` — все строки, столбец 0. `m[0]` — вся первая строка.",
     "id": "np_index.2",
     "expected": "6 [1 4] [1 2 3]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×3: [[1, 2, 3], [4, 5, 6]]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×3: [[1, 2, 3], [4, 5, 6]]"
         ]
        ],
        "out": "6 [1 4] [1 2 3]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Оставить длины больше 10 и меньше 30.",
     "why": "`and` не умеет сравнивать массивы целиком. Для масок нужен `&`, а каждое условие — в скобках.",
     "id": "np_index.3",
     "fixedLine": "mid = lens[(lens > 10) & (lens < 30)]",
     "lines": [
      "import numpy as np",
      "lens = np.array([5, 14, 40, 22])",
      "mid = lens[lens > 10 and lens < 30]",
      "print(mid)"
     ],
     "bugLine": 2,
     "expected": "[14 22]",
     "actual": "ValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Взять второй столбец таблицы.",
     "why": "`m[1]` — вторая строка. Столбец — `m[:, 1]`: двоеточие значит «все строки».",
     "id": "np_index.4",
     "fixedLine": "print(m[:, 1])",
     "lines": [
      "import numpy as np",
      "m = np.array([[1, 10], [2, 20], [3, 30]])",
      "print(m[1])"
     ],
     "bugLine": 2,
     "expected": "[10 20 30]",
     "actual": "[ 2 20]"
    },
    {
     "type": "order",
     "task": "Заменить отрицательные числа нулями.",
     "id": "np_index.5",
     "lines": [
      "import numpy as np",
      "a = np.array([3, -1, 4, -5])",
      "a[a < 0] = 0",
      "print(a)"
     ],
     "expected": "[3 0 4 0]",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Взять два последних элемента и сложить.",
     "id": "np_index.6",
     "lines": [
      "import numpy as np",
      "a = np.array([4, 8, 15, 16])",
      "tail = a[-2:]",
      "print(tail, tail.sum())"
     ],
     "expected": "[15 16] 31",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши маску: оценки не ниже 0.7.",
     "why": "Маска — сравнение массива с числом: `scores >= 0.7`.",
     "id": "np_index.7",
     "lines": [
      "import numpy as np",
      "scores = np.array([0.9, 0.4, 0.75])",
      "good = scores[]",
      "print(len(good))"
     ],
     "gapLine": 2,
     "before": "good = scores[",
     "after": "]",
     "answer": "scores >= 0.7",
     "expected": "2"
    },
    {
     "type": "fill",
     "task": "Допиши индекс: строка 1, столбец 0.",
     "why": "Сначала номер строки, потом столбца, через запятую.",
     "id": "np_index.8",
     "lines": [
      "import numpy as np",
      "m = np.array([[1, 2], [3, 4]])",
      "print(m[])"
     ],
     "gapLine": 2,
     "before": "print(m[",
     "after": "])",
     "answer": "1, 0",
     "expected": "3"
    },
    {
     "type": "write",
     "task": "Напиши функцию `count_above(values, limit)`: сколько чисел больше `limit`.",
     "starter": "import numpy as np\n\n\ndef count_above(values, limit):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef count_above(values, limit):\n    return int((np.array(values) > limit).sum())",
     "tests": [
      "count_above([1, 5, 10], 4)",
      "count_above([], 1)",
      "count_above([3, 3], 3)"
     ],
     "hints": [
      "Сделай массив и маску: `np.array(values) > limit`.",
      "Сумма маски — число True.",
      "`return int((np.array(values) > limit).sum())`"
     ],
     "setup": "",
     "id": "np_index.9",
     "testsPy": "_TESTS = [('count_above([1, 5, 10], 4)', '2'), ('count_above([], 1)', '0'), ('count_above([3, 3], 3)', '0')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `column(rows, j)`: столбец `j` из списка строк таблицы, обычным списком.",
     "starter": "import numpy as np\n\n\ndef column(rows, j):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef column(rows, j):\n    return np.array(rows)[:, j].tolist()",
     "tests": [
      "column([[1, 2], [3, 4]], 1)",
      "column([[7, 8, 9]], 0)"
     ],
     "hints": [
      "Преврати список строк в массив.",
      "Весь столбец — срез `[:, j]`.",
      "`return np.array(rows)[:, j].tolist()`"
     ],
     "setup": "",
     "id": "np_index.10",
     "testsPy": "_TESTS = [('column([[1, 2], [3, 4]], 1)', '[2, 4]'), ('column([[7, 8, 9]], 0)', '[7]')]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "np_agg",
   "title": "NumPy: подсчёты",
   "diag": [],
   "intro": "`sum`, `mean`, `max`, `min` считают по всему массиву, `argmax` — номер самого большого элемента. В таблице `axis=0` считает по столбцам (сверху вниз), `axis=1` — по строкам (слева направо). Так считают метрики: точность — это среднее маски «предсказание совпало».",
   "tasks": [
    {
     "type": "predict",
     "code": "import numpy as np\na = np.array([3, 9, 6])\nprint(a.sum(), a.mean(), a.argmax())",
     "why": "Среднее всегда дробное. `argmax` — номер максимума: 9 стоит на месте 1.",
     "id": "np_agg.1",
     "expected": "18 6.0 1",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 3: [3, 9, 6]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "a",
          "массив 3: [3, 9, 6]"
         ]
        ],
        "out": "18 6.0 1\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import numpy as np\nm = np.array([[1, 2], [3, 4]])\nprint(m.sum(axis=0), m.sum(axis=1))",
     "why": "`axis=0` складывает по столбцам: 1+3 и 2+4. `axis=1` — по строкам: 1+2 и 3+4.",
     "id": "np_agg.2",
     "expected": "[4 6] [3 7]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×2: [[1, 2], [3, 4]]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "m",
          "массив 2×2: [[1, 2], [3, 4]]"
         ]
        ],
        "out": "[4 6] [3 7]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Средняя оценка каждой модели. Каждая строка — одна модель.",
     "why": "`axis=0` усредняет по столбцам, то есть по разным моделям. Для каждой строки нужен `axis=1`.",
     "id": "np_agg.3",
     "fixedLine": "print(scores.mean(axis=1).round(2).tolist())",
     "lines": [
      "import numpy as np",
      "scores = np.array([[0.8, 0.6], [0.9, 0.7]])",
      "print(scores.mean(axis=0).round(2).tolist())"
     ],
     "bugLine": 2,
     "expected": "[0.7, 0.8]",
     "actual": "[0.85, 0.65]"
    },
    {
     "type": "bug",
     "task": "Найти номер лучшей модели.",
     "why": "`max` даёт само значение, а номер элемента — `argmax`.",
     "id": "np_agg.4",
     "fixedLine": "print(f1.argmax())",
     "lines": [
      "import numpy as np",
      "f1 = np.array([0.71, 0.88, 0.80])",
      "print(f1.max())"
     ],
     "bugLine": 2,
     "expected": "1",
     "actual": "0.88"
    },
    {
     "type": "order",
     "task": "Посчитать долю длинных строк.",
     "id": "np_agg.5",
     "lines": [
      "import numpy as np",
      "lens = np.array([5, 14, 40, 22])",
      "long = lens > 10",
      "print(long.mean())"
     ],
     "expected": "0.75",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "order",
     "task": "Посчитать точность предсказаний.",
     "id": "np_agg.6",
     "lines": [
      "import numpy as np",
      "y_true = np.array([1, 0, 1, 1])",
      "y_pred = np.array([1, 1, 1, 0])",
      "acc = (y_true == y_pred).mean()",
      "print(acc)"
     ],
     "expected": "0.5",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ],
      [
       0,
       2,
       1,
       3,
       4
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: среднее по каждому столбцу.",
     "why": "По столбцам — `axis=0`.",
     "id": "np_agg.7",
     "lines": [
      "import numpy as np",
      "m = np.array([[2, 4], [6, 8]])",
      "print(m.mean())"
     ],
     "gapLine": 2,
     "before": "print(m.mean(",
     "after": "))",
     "answer": "axis=0",
     "expected": "[4. 6.]"
    },
    {
     "type": "fill",
     "task": "Допиши: номер самого маленького значения.",
     "why": "Номер минимума — `argmin()`, по аналогии с `argmax()`.",
     "id": "np_agg.8",
     "lines": [
      "import numpy as np",
      "losses = np.array([0.9, 0.3, 0.5])",
      "print(losses)"
     ],
     "gapLine": 2,
     "before": "print(losses",
     "after": ")",
     "answer": ".argmin()",
     "expected": "1"
    },
    {
     "type": "write",
     "task": "Напиши функцию `accuracy(y_true, y_pred)`: доля совпадений, округлённая до двух знаков.",
     "starter": "import numpy as np\n\n\ndef accuracy(y_true, y_pred):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef accuracy(y_true, y_pred):\n    return round(float((np.array(y_true) == np.array(y_pred)).mean()), 2)",
     "tests": [
      "accuracy([1, 0, 1], [1, 1, 1])",
      "accuracy([1, 1], [1, 1])"
     ],
     "hints": [
      "Сравни два массива: получится маска совпадений.",
      "Доля True — среднее маски: `.mean()`.",
      "`return round(float((np.array(y_true) == np.array(y_pred)).mean()), 2)`"
     ],
     "setup": "",
     "id": "np_agg.9",
     "testsPy": "_TESTS = [('accuracy([1, 0, 1], [1, 1, 1])', '0.67'), ('accuracy([1, 1], [1, 1])', '1.0')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `best_model(names, scores)`: имя модели с самой высокой оценкой.",
     "starter": "import numpy as np\n\n\ndef best_model(names, scores):\n    # твой код\n    pass",
     "solution": "import numpy as np\n\n\ndef best_model(names, scores):\n    return names[int(np.argmax(scores))]",
     "tests": [
      "best_model([\"a\", \"b\", \"c\"], [0.5, 0.9, 0.7])",
      "best_model([\"x\"], [0.1])"
     ],
     "hints": [
      "Нужен номер максимума: `np.argmax(scores)`.",
      "По этому номеру возьми имя из `names`.",
      "`return names[int(np.argmax(scores))]`"
     ],
     "setup": "",
     "id": "np_agg.10",
     "testsPy": "_TESTS = [('best_model([\"a\", \"b\", \"c\"], [0.5, 0.9, 0.7])', \"'b'\"), ('best_model([\"x\"], [0.1])', \"'x'\")]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "pd_frame",
   "title": "pandas: таблица DataFrame",
   "diag": [],
   "intro": "DataFrame — таблица: строка — одна запись, колонка — одно поле. Её делают из списка словарей `pd.DataFrame(poems)` или из словаря колонок. `df.shape` — размеры, `df[\"lines\"]` — одна колонка (Series), `df[[\"title\", \"lines\"]]` — несколько, `df.iloc[0]` — первая строка. `tolist()` превращает колонку в список.",
   "tasks": [
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame([{\"title\": \"Hope\", \"lines\": 12}, {\"title\": \"Raven\", \"lines\": 108}])\nprint(df.shape, list(df.columns))",
     "why": "Каждый словарь стал строкой, ключи — колонками.",
     "id": "pd_frame.1",
     "expected": "(2, 2) ['title', 'lines']",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 2×2, колонки: title, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 2×2, колонки: title, lines"
         ]
        ],
        "out": "(2, 2) ['title', 'lines']\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"title\": [\"Hope\", \"Raven\", \"Tyger\"], \"lines\": [12, 108, 24]})\nprint(df[\"lines\"].sum(), df[\"title\"].tolist()[-1])",
     "why": "Колонку можно сложить целиком, а `tolist()` делает из неё обычный список.",
     "id": "pd_frame.2",
     "expected": "144 Tyger",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: title, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: title, lines"
         ]
        ],
        "out": "144 Tyger\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Найти самое длинное стихотворение по числу строк.",
     "why": "Название колонки должно совпадать до буквы, включая регистр. Список колонок — `df.columns`.",
     "id": "pd_frame.3",
     "fixedLine": "print(df[\"lines\"].max())",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Raven\"], \"lines\": [12, 108]})",
      "print(df[\"Lines\"].max())"
     ],
     "bugLine": 2,
     "expected": "108",
     "actual": "KeyError: 'Lines'",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Взять две колонки.",
     "why": "Несколько колонок передают списком, поэтому скобки двойные: `df[[\"title\", \"lines\"]]`.",
     "id": "pd_frame.4",
     "fixedLine": "print(df[[\"title\", \"lines\"]].shape)",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\"], \"author\": [\"Dickinson\"], \"lines\": [12]})",
      "print(df[\"title\", \"lines\"].shape)"
     ],
     "bugLine": 2,
     "expected": "(1, 2)",
     "actual": "KeyError: ('title', 'lines')",
     "actualError": true
    },
    {
     "type": "order",
     "task": "Построить таблицу и напечатать первую запись.",
     "id": "pd_frame.5",
     "lines": [
      "import pandas as pd",
      "poems = [{\"title\": \"Hope\", \"lines\": 12}, {\"title\": \"Raven\", \"lines\": 108}]",
      "df = pd.DataFrame(poems)",
      "first = df.iloc[0]",
      "print(first[\"title\"], first[\"lines\"])"
     ],
     "expected": "Hope 12",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ],
      [
       1,
       0,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "order",
     "task": "Посчитать среднюю длину.",
     "id": "pd_frame.6",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"lines\": [12, 108, 24]})",
      "avg = df[\"lines\"].mean()",
      "print(round(avg, 1))"
     ],
     "expected": "48.0",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: сколько строк в таблице.",
     "why": "Число строк — `len(df)` или `df.shape[0]`.",
     "id": "pd_frame.7",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Raven\"], \"lines\": [12, 108]})",
      "print()"
     ],
     "gapLine": 2,
     "before": "print(",
     "after": ")",
     "answer": "len(df)",
     "expected": "2"
    },
    {
     "type": "fill",
     "task": "Допиши: колонка с названиями.",
     "why": "Колонку берут по названию в квадратных скобках.",
     "id": "pd_frame.8",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Raven\", \"Tyger\"]})",
      "print(df.tolist())"
     ],
     "gapLine": 2,
     "before": "print(df",
     "after": ".tolist())",
     "answer": "[\"title\"]",
     "expected": "['Hope', 'Raven', 'Tyger']"
    },
    {
     "type": "write",
     "task": "Напиши функцию `total_lines(poems)`: сумма поля `\"lines\"` по списку словарей. Сделай через DataFrame.",
     "starter": "import pandas as pd\n\n\ndef total_lines(poems):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef total_lines(poems):\n    df = pd.DataFrame(poems)\n    return int(df[\"lines\"].sum())",
     "tests": [
      "total_lines([{\"title\": \"a\", \"lines\": 3}, {\"title\": \"b\", \"lines\": 4}])",
      "total_lines([{\"title\": \"a\", \"lines\": 10}])"
     ],
     "hints": [
      "Сделай таблицу: `pd.DataFrame(poems)`.",
      "Сумма колонки — `df[\"lines\"].sum()`.",
      "`return int(df[\"lines\"].sum())`"
     ],
     "setup": "",
     "id": "pd_frame.9",
     "testsPy": "_TESTS = [('total_lines([{\"title\": \"a\", \"lines\": 3}, {\"title\": \"b\", \"lines\": 4}])', '7'), ('total_lines([{\"title\": \"a\", \"lines\": 10}])', '10')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `titles(df)`: список значений колонки `\"title\"`.",
     "starter": "import pandas as pd\n\n\ndef titles(df):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef titles(df):\n    return df[\"title\"].tolist()",
     "tests": [
      "titles(pd.DataFrame({\"title\": [\"A\", \"B\"]}))",
      "titles(pd.DataFrame({\"title\": []}))"
     ],
     "hints": [
      "Колонка — `df[\"title\"]`.",
      "В список превращает `tolist()`.",
      "`return df[\"title\"].tolist()`"
     ],
     "setup": "",
     "id": "pd_frame.10",
     "testsPy": "_TESTS = [('titles(pd.DataFrame({\"title\": [\"A\", \"B\"]}))', \"['A', 'B']\"), ('titles(pd.DataFrame({\"title\": []}))', '[]')]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "pd_filter",
   "title": "pandas: фильтры и новые колонки",
   "diag": [],
   "intro": "Фильтр — маска, как в NumPy: `df[df[\"lines\"] > 20]`. Два условия — через `&`, каждое в скобках. Новая колонка появляется присваиванием: `df[\"stanzas\"] = df[\"lines\"] // 4`. Методы строк вызывают через `.str`: `df[\"title\"].str.len()`. Сортировка — `sort_values`.",
   "tasks": [
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"title\": [\"Hope\", \"Raven\", \"Tyger\"], \"lines\": [12, 108, 24]})\nlong = df[df[\"lines\"] > 20]\nprint(long[\"title\"].tolist())",
     "why": "Маска оставляет строки таблицы, где условие верно.",
     "id": "pd_filter.1",
     "expected": "['Raven', 'Tyger']",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: title, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: title, lines"
         ],
         [
          "long",
          "таблица 2×2, колонки: title, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: title, lines"
         ],
         [
          "long",
          "таблица 2×2, колонки: title, lines"
         ]
        ],
        "out": "['Raven', 'Tyger']\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"title\": [\"Hope\", \"Raven\"], \"lines\": [12, 108]})\ndf[\"stanzas\"] = df[\"lines\"] // 4\nprint(df[\"stanzas\"].tolist(), df.shape)",
     "why": "Новая колонка считается для каждой строки сразу, колонок стало три.",
     "id": "pd_filter.2",
     "expected": "[3, 27] (2, 3)",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 2×2, колонки: title, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": 3,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 2×3, колонки: title, lines, stanzas"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 2×3, колонки: title, lines, stanzas"
         ]
        ],
        "out": "[3, 27] (2, 3)\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Найти стихотворения По длиннее 50 строк.",
     "why": "`&` выполняется раньше сравнений, поэтому Python пытается вычислить `\"Poe\" & df[\"lines\"]`. Каждое условие берут в скобки.",
     "id": "pd_filter.3",
     "fixedLine": "sel = df[(df[\"author\"] == \"Poe\") & (df[\"lines\"] > 50)]",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Poe\", \"Keats\"], \"lines\": [108, 20, 80]})",
      "sel = df[df[\"author\"] == \"Poe\" & df[\"lines\"] > 50]",
      "print(len(sel))"
     ],
     "bugLine": 2,
     "expected": "1",
     "actual": "TypeError: Cannot perform 'rand_' with a dtyped [int64] array and scalar of type [bool]",
     "actualError": true
    },
    {
     "type": "bug",
     "task": "Найти самое длинное стихотворение сортировкой.",
     "why": "По умолчанию сортировка по возрастанию, и первым оказывается самое короткое. Нужно `ascending=False`.",
     "id": "pd_filter.4",
     "fixedLine": "top = df.sort_values(\"lines\", ascending=False)",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Raven\", \"Tyger\"], \"lines\": [12, 108, 24]})",
      "top = df.sort_values(\"lines\")",
      "print(top[\"title\"].tolist()[0])"
     ],
     "bugLine": 2,
     "expected": "Raven",
     "actual": "Hope"
    },
    {
     "type": "order",
     "task": "Найти самое длинное название.",
     "id": "pd_filter.5",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"The Raven\", \"Tyger\"]})",
      "df[\"n\"] = df[\"title\"].str.len()",
      "best = df.sort_values(\"n\").iloc[-1]",
      "print(best[\"title\"], best[\"n\"])"
     ],
     "expected": "The Raven 9",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "order",
     "task": "Оставить строки со словом love.",
     "id": "pd_filter.6",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"line\": [\"love is\", \"sea\", \"my love\"]})",
      "mask = df[\"line\"].str.contains(\"love\")",
      "print(df[mask][\"line\"].tolist())"
     ],
     "expected": "['love is', 'my love']",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши маску: стихотворения короче 50 строк.",
     "why": "Маска — сравнение колонки с числом.",
     "id": "pd_filter.7",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Raven\"], \"lines\": [12, 108]})",
      "short = df[]",
      "print(short[\"title\"].tolist())"
     ],
     "gapLine": 2,
     "before": "short = df[",
     "after": "]",
     "answer": "df[\"lines\"] < 50",
     "expected": "['Hope']"
    },
    {
     "type": "fill",
     "task": "Допиши: все названия заглавными буквами.",
     "why": "Методы строк для колонки вызывают через `.str`.",
     "id": "pd_filter.8",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"hope\", \"raven\"]})",
      "df[\"title\"] = df[\"title\"]",
      "print(df[\"title\"].tolist())"
     ],
     "gapLine": 2,
     "before": "df[\"title\"] = df[\"title\"]",
     "after": "",
     "answer": ".str.upper()",
     "expected": "['HOPE', 'RAVEN']"
    },
    {
     "type": "write",
     "task": "Напиши функцию `long_titles(df, n)`: названия стихотворений, у которых больше `n` строк. В таблице колонки `\"title\"` и `\"lines\"`.",
     "starter": "import pandas as pd\n\n\ndef long_titles(df, n):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef long_titles(df, n):\n    return df[df[\"lines\"] > n][\"title\"].tolist()",
     "tests": [
      "long_titles(pd.DataFrame({\"title\": [\"A\", \"B\"], \"lines\": [5, 50]}), 10)",
      "long_titles(pd.DataFrame({\"title\": [\"A\"], \"lines\": [5]}), 10)"
     ],
     "hints": [
      "Отфильтруй строки маской `df[\"lines\"] > n`.",
      "Из результата возьми колонку `\"title\"` и `tolist()`.",
      "`return df[df[\"lines\"] > n][\"title\"].tolist()`"
     ],
     "setup": "",
     "id": "pd_filter.9",
     "testsPy": "_TESTS = [('long_titles(pd.DataFrame({\"title\": [\"A\", \"B\"], \"lines\": [5, 50]}), 10)', \"['B']\"), ('long_titles(pd.DataFrame({\"title\": [\"A\"], \"lines\": [5]}), 10)', '[]')]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `add_words(df)`: добавь колонку `\"words\"` — число слов в колонке `\"line\"` — и верни таблицу.",
     "starter": "import pandas as pd\n\n\ndef add_words(df):\n    # твой код\n    return df",
     "solution": "import pandas as pd\n\n\ndef add_words(df):\n    df[\"words\"] = df[\"line\"].str.split().str.len()\n    return df",
     "tests": [
      "add_words(pd.DataFrame({\"line\": [\"a b\", \"c\"]}))[\"words\"].tolist()",
      "add_words(pd.DataFrame({\"line\": [\"one two three\"]}))[\"words\"].tolist()"
     ],
     "hints": [
      "Разбей каждую строку на слова: `df[\"line\"].str.split()`.",
      "Длину каждого списка даёт ещё один `.str.len()`.",
      "`df[\"words\"] = df[\"line\"].str.split().str.len()`, потом `return df`."
     ],
     "setup": "",
     "id": "pd_filter.10",
     "testsPy": "_TESTS = [('add_words(pd.DataFrame({\"line\": [\"a b\", \"c\"]}))[\"words\"].tolist()', '[2, 1]'), ('add_words(pd.DataFrame({\"line\": [\"one two three\"]}))[\"words\"].tolist()', '[3]')]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "pd_group",
   "title": "pandas: группировка",
   "diag": [],
   "intro": "`value_counts()` считает, сколько раз встречается каждое значение, — так смотрят баланс классов. `df.groupby(\"author\")[\"lines\"].mean()` считает среднее отдельно для каждого автора. Результат — Series, где авторы стоят в индексе; `to_dict()` превращает её в словарь.",
   "tasks": [
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"]})\nprint(df[\"author\"].value_counts().to_dict())",
     "why": "`value_counts` считает повторы и ставит самые частые первыми.",
     "id": "pd_group.1",
     "expected": "{'Poe': 2, 'Keats': 1}",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×1, колонки: author"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×1, колонки: author"
         ]
        ],
        "out": "{'Poe': 2, 'Keats': 1}\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]})\nprint(df.groupby(\"author\")[\"lines\"].sum().to_dict())",
     "why": "Группы отсортированы по названию: сначала Keats. У По 108 + 20 строк.",
     "id": "pd_group.2",
     "expected": "{'Keats': 14, 'Poe': 128}",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: author, lines"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×2, колонки: author, lines"
         ]
        ],
        "out": "{'Keats': 14, 'Poe': 128}\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Средняя длина стихотворения у каждого автора.",
     "why": "`count` считает, сколько записей в группе. Среднее — `mean`.",
     "id": "pd_group.3",
     "fixedLine": "print(df.groupby(\"author\")[\"lines\"].mean().to_dict())",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]})",
      "print(df.groupby(\"author\")[\"lines\"].count().to_dict())"
     ],
     "bugLine": 2,
     "expected": "{'Keats': 14.0, 'Poe': 64.0}",
     "actual": "{'Keats': 1, 'Poe': 2}"
    },
    {
     "type": "bug",
     "task": "Найти самого частого автора.",
     "why": "`value_counts` сортирует по убыванию: самый частый — первый, `index[0]`.",
     "id": "pd_group.4",
     "fixedLine": "print(df[\"author\"].value_counts().index[0])",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"]})",
      "print(df[\"author\"].value_counts().index[-1])"
     ],
     "bugLine": 2,
     "expected": "Poe",
     "actual": "Keats"
    },
    {
     "type": "order",
     "task": "Найти автора с самыми длинными стихами в среднем.",
     "id": "pd_group.5",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]})",
      "avg = df.groupby(\"author\")[\"lines\"].mean()",
      "best = avg.idxmax()",
      "print(best, avg[best])"
     ],
     "expected": "Poe 64.0",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "order",
     "task": "Посчитать доли классов в разметке.",
     "id": "pd_group.6",
     "lines": [
      "import pandas as pd",
      "labels = pd.Series([\"joy\", \"sad\", \"joy\", \"joy\"])",
      "share = labels.value_counts(normalize=True)",
      "print(share.to_dict())"
     ],
     "expected": "{'joy': 0.75, 'sad': 0.25}",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши, по какой колонке группировать.",
     "why": "Группируем по автору: `groupby(\"author\")`.",
     "id": "pd_group.7",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]})",
      "print(df.groupby()[\"lines\"].max().to_dict())"
     ],
     "gapLine": 2,
     "before": "print(df.groupby(",
     "after": ")[\"lines\"].max().to_dict())",
     "answer": "\"author\"",
     "expected": "{'Keats': 14, 'Poe': 108}"
    },
    {
     "type": "fill",
     "task": "Допиши: сколько раз встречается каждый автор.",
     "why": "Повторы считает `value_counts()`.",
     "id": "pd_group.8",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"]})",
      "print(df[\"author\"].to_dict())"
     ],
     "gapLine": 2,
     "before": "print(df[\"author\"]",
     "after": ".to_dict())",
     "answer": ".value_counts()",
     "expected": "{'Poe': 2, 'Keats': 1}"
    },
    {
     "type": "write",
     "task": "Напиши функцию `poems_per_author(df)`: словарь «автор → число стихотворений».",
     "starter": "import pandas as pd\n\n\ndef poems_per_author(df):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef poems_per_author(df):\n    return df[\"author\"].value_counts().to_dict()",
     "tests": [
      "poems_per_author(pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"]}))",
      "poems_per_author(pd.DataFrame({\"author\": [\"Blake\"]}))"
     ],
     "hints": [
      "Повторы в колонке считает `value_counts()`.",
      "В словарь превращает `to_dict()`.",
      "`return df[\"author\"].value_counts().to_dict()`"
     ],
     "setup": "",
     "id": "pd_group.9",
     "testsPy": "_TESTS = [('poems_per_author(pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"]}))', \"{'Poe': 2, 'Keats': 1}\"), ('poems_per_author(pd.DataFrame({\"author\": [\"Blake\"]}))', \"{'Blake': 1}\")]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `mean_lines(df)`: словарь «автор → средняя длина», округлённая до одного знака.",
     "starter": "import pandas as pd\n\n\ndef mean_lines(df):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef mean_lines(df):\n    return df.groupby(\"author\")[\"lines\"].mean().round(1).to_dict()",
     "tests": [
      "mean_lines(pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]}))",
      "mean_lines(pd.DataFrame({\"author\": [\"A\", \"A\", \"A\"], \"lines\": [1, 2, 2]}))"
     ],
     "hints": [
      "Группируй по автору и бери колонку `\"lines\"`.",
      "Среднее — `mean()`, округление — `round(1)`.",
      "`return df.groupby(\"author\")[\"lines\"].mean().round(1).to_dict()`"
     ],
     "setup": "",
     "id": "pd_group.10",
     "testsPy": "_TESTS = [('mean_lines(pd.DataFrame({\"author\": [\"Poe\", \"Keats\", \"Poe\"], \"lines\": [108, 14, 20]}))', \"{'Keats': 14.0, 'Poe': 64.0}\"), ('mean_lines(pd.DataFrame({\"author\": [\"A\", \"A\", \"A\"], \"lines\": [1, 2, 2]}))', \"{'A': 1.7}\")]\n"
    }
   ],
   "track": "data"
  },
  {
   "id": "pd_clean",
   "title": "pandas: чистка данных",
   "diag": [],
   "intro": "В настоящих данных бывают пропуски (NaN), повторы и лишние пробелы. `isna().sum()` считает пропуски, `dropna()` убирает строки с ними, `fillna(0)` заполняет. `drop_duplicates()` убирает повторы, `astype(int)` меняет тип. Эти методы возвращают новую таблицу — результат нужно присвоить.",
   "tasks": [
    {
     "type": "predict",
     "code": "import pandas as pd\ns = pd.Series([12, None, 24])\nprint(s.isna().sum(), s.fillna(0).tolist())",
     "why": "Пропуск один. Из-за пропуска колонка стала дробной, поэтому и после заполнения числа дробные.",
     "id": "pd_clean.1",
     "expected": "1 [12.0, 0.0, 24.0]",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "s",
          "колонка: [12.0, nan, 24.0]"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "s",
          "колонка: [12.0, nan, 24.0]"
         ]
        ],
        "out": "1 [12.0, 0.0, 24.0]\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "predict",
     "code": "import pandas as pd\ndf = pd.DataFrame({\"title\": [\"Hope\", \"Hope\", \"Raven\"]})\nprint(len(df), len(df.drop_duplicates()))",
     "why": "`drop_duplicates` убирает строки, полностью совпадающие с более ранними.",
     "id": "pd_clean.2",
     "expected": "3 2",
     "trace": {
      "steps": [
       {
        "line": 0,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 1,
        "scope": "",
        "vars": [],
        "out": ""
       },
       {
        "line": 2,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×1, колонки: title"
         ]
        ],
        "out": ""
       },
       {
        "line": -1,
        "scope": "",
        "vars": [
         [
          "df",
          "таблица 3×1, колонки: title"
         ]
        ],
        "out": "3 2\n"
       }
      ],
      "cut": false
     }
    },
    {
     "type": "bug",
     "task": "Убрать строки с пропусками.",
     "why": "`dropna` не меняет таблицу, а возвращает новую. Её нужно сохранить: `df = df.dropna()`.",
     "id": "pd_clean.3",
     "fixedLine": "df = df.dropna()",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", None, \"Raven\"]})",
      "df.dropna()",
      "print(len(df))"
     ],
     "bugLine": 2,
     "expected": "2",
     "actual": "3"
    },
    {
     "type": "bug",
     "task": "Привести названия к одному виду и посчитать разные.",
     "why": "Без `strip()` пробелы по краям остаются, и « hope» и «hope » считаются разными.",
     "id": "pd_clean.4",
     "fixedLine": "clean = s.str.strip().str.lower()",
     "lines": [
      "import pandas as pd",
      "s = pd.Series([\" Hope\", \"hope \", \"HOPE\"])",
      "clean = s.str.lower()",
      "print(clean.nunique())"
     ],
     "bugLine": 2,
     "expected": "1",
     "actual": "3"
    },
    {
     "type": "order",
     "task": "Заполнить пропуск средним значением.",
     "id": "pd_clean.5",
     "lines": [
      "import pandas as pd",
      "s = pd.Series([10, None, 20])",
      "mean = s.mean()",
      "s = s.fillna(mean)",
      "print(s.tolist())"
     ],
     "expected": "[10.0, 15.0, 20.0]",
     "valid": [
      [
       0,
       1,
       2,
       3,
       4
      ]
     ]
    },
    {
     "type": "order",
     "task": "Превратить строки в числа и посчитать.",
     "id": "pd_clean.6",
     "lines": [
      "import pandas as pd",
      "s = pd.Series([\"12\", \"108\", \"24\"])",
      "n = s.astype(int)",
      "print(n.sum(), n.max())"
     ],
     "expected": "144 108",
     "valid": [
      [
       0,
       1,
       2,
       3
      ]
     ]
    },
    {
     "type": "fill",
     "task": "Допиши: заполни пропуски нулями.",
     "why": "Заполняет пропуски `fillna(значение)`.",
     "id": "pd_clean.7",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"lines\": [12, None, 24]})",
      "df[\"lines\"] = df[\"lines\"]",
      "print(df[\"lines\"].tolist())"
     ],
     "gapLine": 2,
     "before": "df[\"lines\"] = df[\"lines\"]",
     "after": "",
     "answer": ".fillna(0)",
     "expected": "[12.0, 0.0, 24.0]"
    },
    {
     "type": "fill",
     "task": "Допиши: убери повторяющиеся строки.",
     "why": "Повторы убирает `drop_duplicates()`.",
     "id": "pd_clean.8",
     "lines": [
      "import pandas as pd",
      "df = pd.DataFrame({\"title\": [\"Hope\", \"Hope\", \"Raven\"], \"lines\": [12, 12, 108]})",
      "df = df",
      "print(df.shape)"
     ],
     "gapLine": 2,
     "before": "df = df",
     "after": "",
     "answer": ".drop_duplicates()",
     "expected": "(2, 2)"
    },
    {
     "type": "write",
     "task": "Напиши функцию `clean_titles(titles)`: названия без пробелов по краям, строчными буквами, без повторов, в исходном порядке. Сделай через `pd.Series`.",
     "starter": "import pandas as pd\n\n\ndef clean_titles(titles):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef clean_titles(titles):\n    s = pd.Series(titles).str.strip().str.lower()\n    return s.drop_duplicates().tolist()",
     "tests": [
      "clean_titles([\" Hope\", \"hope\", \"Raven \"])",
      "clean_titles([\"A\"])"
     ],
     "hints": [
      "Сделай Series из списка и почисти: `.str.strip().str.lower()`.",
      "Повторы убирает `drop_duplicates()`, порядок сохраняется.",
      "`return pd.Series(titles).str.strip().str.lower().drop_duplicates().tolist()`"
     ],
     "setup": "",
     "id": "pd_clean.9",
     "testsPy": "_TESTS = [('clean_titles([\" Hope\", \"hope\", \"Raven \"])', \"['hope', 'raven']\"), ('clean_titles([\"A\"])', \"['a']\")]\n"
    },
    {
     "type": "write",
     "task": "Напиши функцию `missing_share(values)`: доля пропусков (None) в списке, округлённая до двух знаков.",
     "starter": "import pandas as pd\n\n\ndef missing_share(values):\n    # твой код\n    pass",
     "solution": "import pandas as pd\n\n\ndef missing_share(values):\n    return round(float(pd.Series(values).isna().mean()), 2)",
     "tests": [
      "missing_share([1, None, 3, None])",
      "missing_share([1, 2])",
      "missing_share([None, 1, 2])"
     ],
     "hints": [
      "`isna()` даёт маску пропусков.",
      "Доля True — среднее маски: `.mean()`.",
      "`return round(float(pd.Series(values).isna().mean()), 2)`"
     ],
     "setup": "",
     "id": "pd_clean.10",
     "testsPy": "_TESTS = [('missing_share([1, None, 3, None])', '0.5'), ('missing_share([1, 2])', '0.0'), ('missing_share([None, 1, 2])', '0.33')]\n"
    }
   ],
   "track": "data"
  }
 ],
 "errors": {
  "traceback": {
   "code": "def average(lengths):\n    return sum(lengths) / len(lengths)\n\npoems = []\nprint(average(poems))",
   "text": "Traceback (most recent call last):\n  File \"poem.py\", line 5, in <module>\n    print(average(poems))\n  File \"poem.py\", line 2, in average\n    return sum(lengths) / len(lengths)\nZeroDivisionError: division by zero"
  },
  "items": [
   {
    "name": "SyntaxError",
    "meaning": "Код записан не по правилам Python, и он даже не начал выполняться.",
    "code": "lines = 14\nif lines == 14\n    print(\"sonnet\")",
    "message": "SyntaxError: expected ':'",
    "how": "Чаще всего не хватает двоеточия после `if`, `for`, `def`, скобки или кавычки. Смотри на строку, которую указал Python, и на строку перед ней.",
    "fixed": "lines = 14\nif lines == 14:\n    print(\"sonnet\")",
    "fixedOut": "sonnet"
   },
   {
    "name": "IndentationError",
    "meaning": "Сбились отступы: Python по ним понимает, какие строки внутри `if`, `for` и `def`.",
    "code": "for w in [\"sea\", \"sky\"]:\nprint(w)",
    "message": "IndentationError: expected an indented block after 'for' statement on line 1",
    "how": "Строки внутри блока сдвигают на 4 пробела. Не смешивай пробелы и табуляцию.",
    "fixed": "for w in [\"sea\", \"sky\"]:\n    print(w)",
    "fixedOut": "sea\nsky"
   },
   {
    "name": "NameError",
    "meaning": "Python не знает такого имени: переменная не создана или в названии опечатка.",
    "code": "title = \"Ozymandias\"\nprint(tilte)",
    "message": "NameError: name 'tilte' is not defined",
    "how": "Проверь написание и то, что переменная создана выше по коду. Python различает регистр: `Title` и `title` — разные имена.",
    "fixed": "title = \"Ozymandias\"\nprint(title)",
    "fixedOut": "Ozymandias"
   },
   {
    "name": "TypeError",
    "meaning": "Действие применено к значению неподходящего типа.",
    "code": "lines = 14\nprint(\"Lines: \" + lines)",
    "message": "TypeError: can only concatenate str (not \"int\") to str",
    "how": "Строку нельзя сложить с числом. Преврати число в строку через `str()` или используй f-строку: `f\"Lines: {lines}\"`.",
    "fixed": "lines = 14\nprint(\"Lines: \" + str(lines))",
    "fixedOut": "Lines: 14"
   },
   {
    "name": "ValueError",
    "meaning": "Тип подходит, а значение — нет.",
    "code": "n = int(\"fourteen\")",
    "message": "ValueError: invalid literal for int() with base 10: 'fourteen'",
    "how": "`int()` превращает в число только строку из цифр. Если данные могут быть неправильными, оберни в `try` / `except ValueError`.",
    "fixed": "n = int(\"14\")",
    "fixedOut": ""
   },
   {
    "name": "IndexError",
    "meaning": "Номер элемента за пределами списка или строки.",
    "code": "poets = [\"Keats\", \"Poe\"]\nprint(poets[2])",
    "message": "IndexError: list index out of range",
    "how": "Нумерация с нуля: у списка из двух элементов номера 0 и 1. Последний элемент всегда `[-1]`.",
    "fixed": "poets = [\"Keats\", \"Poe\"]\nprint(poets[1])",
    "fixedOut": "Poe"
   },
   {
    "name": "KeyError",
    "meaning": "В словаре нет такого ключа.",
    "code": "born = {\"Keats\": 1795}\nprint(born[\"Poe\"])",
    "message": "KeyError: 'Poe'",
    "how": "Проверь написание ключа. Если ключа может не быть, используй `get(ключ, запасное_значение)`.",
    "fixed": "born = {\"Keats\": 1795}\nprint(born.get(\"Poe\", \"unknown\"))",
    "fixedOut": "unknown"
   },
   {
    "name": "AttributeError",
    "meaning": "У объекта нет такого метода или поля.",
    "code": "words = [\"sea\", \"sky\"]\nprint(words.lower())",
    "message": "AttributeError: 'list' object has no attribute 'lower'",
    "how": "Сообщение называет тип объекта: здесь у списка нет метода `lower`, он есть у строки. Проверь, что за значение в переменной.",
    "fixed": "words = [\"sea\", \"sky\"]\nprint([w.lower() for w in words])",
    "fixedOut": "['sea', 'sky']"
   },
   {
    "name": "ZeroDivisionError",
    "meaning": "Деление на ноль.",
    "code": "lengths = []\nprint(sum(lengths) / len(lengths))",
    "message": "ZeroDivisionError: division by zero",
    "how": "Перед делением проверь, что делитель не ноль, — часто это пустой список.",
    "fixed": "lengths = []\nprint(sum(lengths) / len(lengths) if lengths else 0)",
    "fixedOut": "0"
   },
   {
    "name": "FileNotFoundError",
    "meaning": "Файла по такому пути нет.",
    "code": "with open(\"poems.csv\", encoding=\"utf-8\") as f:\n    print(f.read())",
    "message": "FileNotFoundError: [Errno 2] No such file or directory: 'poems.csv'",
    "how": "Проверь имя файла и папку, из которой запускаешь программу: путь считается от неё. Команда `ls` (в Windows `dir`) покажет, что лежит в папке."
   },
   {
    "name": "ModuleNotFoundError",
    "meaning": "Python не нашёл библиотеку: в названии опечатка или она не установлена.",
    "code": "import pandsa",
    "message": "ModuleNotFoundError: No module named 'pandsa'",
    "how": "Проверь название. Если оно верное, установи библиотеку в окружение проекта: `pip install pandas`, и убедись, что окружение включено.",
    "fixed": "import pandas",
    "fixedOut": ""
   }
  ]
 }
};
