// Входная диагностика по базе Python.
// У каждого вопроса с кодом правильный вариант проверяется запуском: tools/check_diagnostic.py.
// lesson — где тема разбирается в приложении; doc — глава официального учебника, если её нет в уроках.

window.DIAGNOSTIC = {
  topics: {
    numbers: { title: "Числа и деление", doc: "https://docs.python.org/ru/3/tutorial/introduction.html" },
    strings: { title: "Строки", lesson: "p1/theory/t1" },
    lists: { title: "Списки", lesson: "p1/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/datastructures.html" },
    dicts: { title: "Словари", lesson: "p1/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/datastructures.html" },
    sets: { title: "Множества", lesson: "p1/theory/t1" },
    conditions: { title: "Условия if", doc: "https://docs.python.org/ru/3/tutorial/controlflow.html" },
    loops: { title: "Циклы", lesson: "p1/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/controlflow.html" },
    functions: { title: "Функции", lesson: "p3/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/controlflow.html" },
    comprehensions: { title: "Генераторы списков", lesson: "p1/theory/t1" },
    fstrings: { title: "f-строки", lesson: "p5/theory/t5", doc: "https://docs.python.org/ru/3/tutorial/inputoutput.html" },
    files: { title: "Работа с файлами", lesson: "p1/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/inputoutput.html" },
    errors: { title: "Ошибки и исключения", lesson: "p3/theory/t7", doc: "https://docs.python.org/ru/3/tutorial/errors.html" },
    modules: { title: "Импорт и модули", lesson: "p3/theory/t1", doc: "https://docs.python.org/ru/3/tutorial/modules.html" },
    classes: { title: "Классы", lesson: "p5/theory/t2", doc: "https://docs.python.org/ru/3/tutorial/classes.html" }
  },

  questions: [
    {
      topic: "numbers",
      q: "Что напечатает код?",
      code: "x = 7 / 2\nprint(x)",
      options: ["3.5", "3", "4", "3,5"],
      answer: 0,
      why: "Оператор / всегда даёт дробное число. Целую часть от деления даёт //, остаток — %."
    },
    {
      topic: "numbers",
      q: "Что напечатает код?",
      code: "print(7 // 2, 7 % 2)",
      options: ["3 1", "3.5 1", "3 0", "1 3"],
      answer: 0,
      why: "// — деление нацело (3), % — остаток от деления (1)."
    },
    {
      topic: "strings",
      q: "Что напечатает код?",
      code: 's = "Poetry"\nprint(s[0], s[-1])',
      options: ["P y", "P r", "o y", "Ошибка"],
      answer: 0,
      why: "Счёт идёт с нуля, поэтому s[0] — первая буква. Отрицательный номер считает с конца: s[-1] — последняя."
    },
    {
      topic: "strings",
      q: "Что напечатает код?",
      code: 'print("A Cold Sea".lower().split())',
      options: ["['a', 'cold', 'sea']", "['A', 'Cold', 'Sea']", "a cold sea", "['a cold sea']"],
      answer: 0,
      why: "Сначала lower() делает буквы маленькими, потом split() режет строку по пробелам на список слов."
    },
    {
      topic: "lists",
      q: "Что напечатает код?",
      code: "a = [3, 1, 2]\na.append(5)\nprint(len(a), a[1:3])",
      options: ["4 [1, 2]", "4 [1, 2, 5]", "3 [1, 2]", "4 [3, 1]"],
      answer: 0,
      why: "append добавляет элемент в конец, длина становится 4. Срез [1:3] берёт элементы с номерами 1 и 2, последний номер не включается."
    },
    {
      topic: "lists",
      q: "Что напечатает код?",
      code: "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
      options: ["[1, 2, 3]", "[1, 2]", "[3]", "Ошибка"],
      answer: 0,
      why: "b = a не копирует список, а даёт ему второе имя. Изменение через b видно и через a. Копию делают так: b = a.copy()."
    },
    {
      topic: "dicts",
      q: "Что напечатает код?",
      code: 'd = {"sea": 2}\nd["sky"] = d.get("sky", 0) + 1\nprint(d)',
      options: ["{'sea': 2, 'sky': 1}", "{'sea': 2}", "{'sea': 3}", "KeyError"],
      answer: 0,
      why: "get возвращает 0, если ключа нет, поэтому ошибки не будет, а в словаре появится новый ключ sky."
    },
    {
      topic: "sets",
      q: "Что напечатает код?",
      code: 'print(len(set("banana")))',
      options: ["3", "6", "2", "1"],
      answer: 0,
      why: "Множество оставляет только разные элементы: b, a, n. Их три."
    },
    {
      topic: "conditions",
      q: "Что напечатает код?",
      code: 'x = 5\nif x > 3 and x < 5:\n    print("A")\nelif x == 5:\n    print("B")\nelse:\n    print("C")',
      options: ["B", "A", "C", "A и B"],
      answer: 0,
      why: "Первое условие ложно, потому что 5 < 5 неверно. Второе истинно. Выполняется только первая подошедшая ветка."
    },
    {
      topic: "loops",
      q: "Что напечатает код?",
      code: "total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)",
      options: ["6", "10", "3", "4"],
      answer: 0,
      why: "range(1, 4) даёт 1, 2, 3 — конец не включается. Их сумма равна 6."
    },
    {
      topic: "loops",
      q: "Что напечатает код?",
      code: "n = 0\nwhile n < 10:\n    n += 3\nprint(n)",
      options: ["12", "9", "10", "3"],
      answer: 0,
      why: "n принимает значения 3, 6, 9, 12. При 9 условие ещё верно, поэтому цикл делает последний шаг до 12 и только потом останавливается."
    },
    {
      topic: "functions",
      q: "Что напечатает код?",
      code: "def f(x, y=2):\n    return x * y\n\nprint(f(3), f(3, 3))",
      options: ["6 9", "6 6", "9 9", "Ошибка"],
      answer: 0,
      why: "У y есть значение по умолчанию 2. Если передать второй аргумент, он его заменит."
    },
    {
      topic: "functions",
      q: "Что напечатает код?",
      code: "def g(x):\n    x = x + 1\n\nprint(g(1))",
      options: ["None", "2", "1", "Ошибка"],
      answer: 0,
      why: "В функции нет return, поэтому она возвращает None. Посчитанное значение просто пропадает."
    },
    {
      topic: "comprehensions",
      q: "Что напечатает код?",
      code: 'print([w.upper() for w in ["sea", "sky"] if "e" in w])',
      options: ["['SEA']", "['SEA', 'SKY']", "['sea']", "[]"],
      answer: 0,
      why: "Условие if оставляет только слова с буквой e, а w.upper() делает их заглавными."
    },
    {
      topic: "fstrings",
      q: "Что напечатает код?",
      code: 'name, n = "Keats", 3\nprint(f"{name}: {n * 2}")',
      options: ["Keats: 6", "{name}: {n * 2}", "Keats: 3 * 2", "name: 6"],
      answer: 0,
      why: "В f-строке выражения в фигурных скобках вычисляются и подставляются в текст."
    },
    {
      topic: "files",
      q: "Зачем открывать файл через with open(...) as f: ?",
      options: [
        "Файл закроется сам, когда блок закончится, даже если внутри случилась ошибка",
        "Так файл читается быстрее",
        "Иначе Python не сможет прочитать русские буквы",
        "Без with файл откроется только для записи"
      ],
      answer: 0,
      why: "with гарантирует закрытие файла. Русские буквы — отдельная история: для них нужен encoding=\"utf-8\"."
    },
    {
      topic: "errors",
      q: "Что напечатает код?",
      code: 'try:\n    print(int("ten"))\nexcept ValueError:\n    print("oops")',
      options: ["oops", "10", "ten", "Программа упадёт с ошибкой"],
      answer: 0,
      why: "int(\"ten\") вызывает ValueError, его ловит except, и выполняется print(\"oops\")."
    },
    {
      topic: "modules",
      q: "Что напечатает код?",
      code: 'from collections import Counter\nprint(Counter("aab").most_common(1))',
      options: ["[('a', 2)]", "[('b', 1)]", "{'a': 2, 'b': 1}", "a"],
      answer: 0,
      why: "from ... import берёт Counter из стандартного модуля collections. most_common(1) возвращает самый частый элемент и его количество."
    },
    {
      topic: "classes",
      q: "Что напечатает код?",
      code: "class Clicker:\n    def __init__(self):\n        self.n = 0\n\n    def add(self):\n        self.n += 1\n\nc = Clicker()\nc.add()\nc.add()\nprint(c.n)",
      options: ["2", "0", "1", "Ошибка"],
      answer: 0,
      why: "__init__ задаёт n = 0 при создании объекта, каждый вызов add увеличивает n на 1. self — это сам объект c."
    }
  ]
};
