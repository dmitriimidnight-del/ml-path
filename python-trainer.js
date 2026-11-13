// Создано tools/build_trainer.py: каждая задача проверена запуском в Python 3.13.
window.PYTRAINER = {
 "harness": "\nimport json as _json\n_res = []\nfor _call, _exp in _TESTS:\n    try:\n        _got = eval(_call)\n        _res.append([_call, repr(_got), _got == eval(_exp), _exp])\n    except Exception as _e:\n        _res.append([_call, type(_e).__name__ + \": \" + str(_e), False, _exp])\nprint(\"@@RESULTS@@\" + _json.dumps(_res, ensure_ascii=False))\n",
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
     "expected": "4 2"
    },
    {
     "type": "predict",
     "code": "x = 7 / 2\ny = int(x)\nprint(x, y, type(y).__name__)",
     "why": "`/` всегда даёт дробное число. `int()` отбрасывает дробную часть, а не округляет.",
     "id": "basics.2",
     "expected": "3.5 3 int"
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
    }
   ]
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
     "expected": "N e Never"
    },
    {
     "type": "predict",
     "code": "author = \"Poe\"\nprint(f\"{author.upper()}: {len(author)} letters\")",
     "why": "В фигурных скобках f-строки можно писать любые выражения.",
     "id": "strings.2",
     "expected": "POE: 3 letters"
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
    }
   ]
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
     "expected": "4 Dickinson"
    },
    {
     "type": "predict",
     "code": "nums = [5, 2, 9]\ns = sorted(nums)\nnums.sort(reverse=True)\nprint(s, nums)",
     "why": "`sorted()` возвращает новый список, а `.sort()` меняет сам список.",
     "id": "lists.2",
     "expected": "[2, 5, 9] [9, 5, 2]"
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
    }
   ]
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
     "expected": "medium"
    },
    {
     "type": "predict",
     "code": "word = \"\"\nif word:\n    print(\"есть слово\")\nelse:\n    print(\"пусто\")",
     "why": "Пустая строка, 0, пустой список и None считаются ложью.",
     "id": "conditions.2",
     "expected": "пусто"
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
    }
   ]
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
     "expected": "12"
    },
    {
     "type": "predict",
     "code": "for i in range(1, 4):\n    print(i * \"*\")",
     "why": "Строку можно умножить на число: `2 * \"*\"` — это `\"**\"`.",
     "id": "loops.2",
     "expected": "*\n**\n***"
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
    }
   ]
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
     "expected": "{'hope': 3, 'soul': 1, 'bird': 1}"
    },
    {
     "type": "predict",
     "code": "words = [\"the\", \"sea\", \"the\", \"sky\", \"sea\"]\nprint(len(words), len(set(words)))",
     "why": "Во множестве каждое значение встречается один раз.",
     "id": "dicts.2",
     "expected": "5 3"
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
    }
   ]
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
     "expected": "Hello, Emily!\nHi, Edgar!"
    },
    {
     "type": "predict",
     "code": "def double(x):\n    print(x * 2)\n\nresult = double(4)\nprint(result)",
     "why": "`print` показывает значение, а `return` возвращает его. Функция без `return` возвращает None.",
     "id": "functions.2",
     "expected": "8\nNone"
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
    }
   ]
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
     "expected": "[3, 4, 5]"
    },
    {
     "type": "predict",
     "code": "words = [\"the\", \"raven\", \"a\", \"door\"]\nprint([w.upper() for w in words if len(w) > 3])",
     "why": "Условие справа отбирает элементы, выражение слева их меняет.",
     "id": "comprehensions.2",
     "expected": "['RAVEN', 'DOOR']"
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
    }
   ]
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
     "expected": "0"
    },
    {
     "type": "predict",
     "code": "def safe_div(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n\nprint(safe_div(6, 3), safe_div(1, 0))",
     "why": "Делить на ноль нельзя: вторая попытка попадает в `except`.",
     "id": "errors.2",
     "expected": "2.0 None"
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
    }
   ]
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
     "expected": "Hope 2"
    },
    {
     "type": "predict",
     "code": "with open(\"note.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"line one\\nline two\\n\")\n\nwith open(\"note.txt\", encoding=\"utf-8\") as f:\n    print(len(f.readlines()))",
     "why": "`readlines()` возвращает список строк файла.",
     "id": "classes.2",
     "expected": "2"
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
    }
   ]
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
