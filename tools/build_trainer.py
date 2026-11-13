"""Builds python-trainer.js: the Python trainer (14 topics, 190 tasks) and the error guide.

Every task is checked by running it in regular Python (the browser uses Pyodide with
the same Python 3.13):
  predict  the output shown as the answer is the real output of the code;
  bug      the fixed code works, the broken one differs by exactly one line and
           really prints something else or fails; both results are recorded;
  order    every order of lines that prints the same result is accepted;
  fill     the full code works, and the code with an empty gap does not give the same result;
  write    the reference solution passes all tests and the starter code fails at least one.
Run: python3 tools/build_trainer.py
"""
import contextlib
import io
import itertools
import json
import os
import pathlib
import re
import sys
import tempfile
import traceback
import types

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAP = re.compile(r"⟦(.+?)⟧")

HARNESS = '''
import json as _json
_res = []
for _call, _exp in _TESTS:
    try:
        _got = eval(_call)
        _res.append([_call, repr(_got), _got == eval(_exp), _exp])
    except Exception as _e:
        _res.append([_call, type(_e).__name__ + ": " + str(_e), False, _exp])
print("@@RESULTS@@" + _json.dumps(_res, ensure_ascii=False))
'''


def run(code):
    """Run code in a fresh folder. Returns (stdout, error line or None)."""
    out = io.StringIO()
    old = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            with contextlib.redirect_stdout(out):
                exec(compile(code, "<task>", "exec"), {"__name__": "__main__"})
            err = None
        except SyntaxError as e:
            err = "%s: %s" % (type(e).__name__, e.msg)
        except Exception as e:
            err = "%s: %s" % (type(e).__name__, e) if str(e) else type(e).__name__
        finally:
            os.chdir(old)
    return out.getvalue(), err


def norm(text):
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


# ---------- task constructors ----------

def P(code, why):
    return {"type": "predict", "code": code.strip("\n"), "why": why}


def B(task, code, line, broken, why):
    return {"type": "bug", "task": task, "code": code.strip("\n"), "line": line, "broken": broken, "why": why}


def O(task, code):
    return {"type": "order", "task": task, "code": code.strip("\n")}


def F(task, code, why=""):
    return {"type": "fill", "task": task, "code": code.strip("\n"), "why": why}


def W(task, starter, solution, tests, hints, setup=""):
    return {"type": "write", "task": task, "starter": starter.strip("\n"), "solution": solution.strip("\n"),
            "tests": tests, "hints": hints, "setup": setup.strip("\n")}


TOPICS = []


def topic(tid, title, diag, intro, tasks):
    TOPICS.append({"id": tid, "title": title, "diag": diag, "intro": intro, "tasks": tasks})


# ---------- content ----------

topic("basics", "Числа и переменные", ["numbers"],
      "Переменная — имя для значения. `/` всегда даёт дробное число, `//` — целую часть от деления, `%` — остаток. "
      "`int()` и `float()` превращают строку в число.", [
    P("""
lines = 14
stanzas = 3
print(lines // stanzas, lines % stanzas)
""", "`//` — целая часть от деления, `%` — остаток: 14 = 3 · 4 + 2."),
    P("""
x = 7 / 2
y = int(x)
print(x, y, type(y).__name__)
""", "`/` всегда даёт дробное число. `int()` отбрасывает дробную часть, а не округляет."),
    B("Посчитать, сколько слов приходится на строку: 120 слов на 8 строк.", """
words = "120"
lines = 8
print(int(words) / lines)
""", 2, "print(words / lines)",
      "Число из файла или из `input()` часто приходит строкой. Строку нельзя делить: сначала `int()`."),
    B("Сколько полных строф по 4 строки получится из 18 строк?", """
lines = 18
full = lines // 4
print(full)
""", 1, "full = lines / 4",
      "`/` даёт дробь 4.5. Количество полных строф — целая часть от деления, `//`."),
    O("Посчитать, сколько слов в среднем приходится на строку.", """
words = 96
lines = 12
average = words / lines
print(average)
"""),
    O("Поменять значения `a` и `b` местами через временную переменную.", """
a = "Keats"
b = "Poe"
tmp = a
a = b
b = tmp
print(a, b)
"""),
    F("Допиши выражение: сколько строк не вошло в полные строфы?", """
lines = 18
size = 4
rest = ⟦lines % size⟧
print(rest)
""", "Остаток от деления даёт `%`."),
    F("Допиши: сколько букв в названии?", """
title = "Ozymandias"
n = ⟦len(title)⟧
print(n)
""", "Длину строки, списка и словаря даёт `len()`."),
    W("Напиши функцию `full_stanzas(lines, size)`: сколько полных строф по `size` строк получится из `lines` строк.", """
def full_stanzas(lines, size):
    # твой код
    pass
""", """
def full_stanzas(lines, size):
    return lines // size
""", [("full_stanzas(14, 4)", "3"), ("full_stanzas(16, 4)", "4"), ("full_stanzas(3, 4)", "0")],
      ["Нужна целая часть от деления.", "В Python это оператор `//`.", "`return lines // size`"]),
    W("Напиши функцию `average(total, count)`: среднее, округлённое до одного знака после точки.", """
def average(total, count):
    # твой код
    pass
""", """
def average(total, count):
    return round(total / count, 1)
""", [("average(10, 4)", "2.5"), ("average(7, 3)", "2.3"), ("average(9, 3)", "3.0")],
      ["Раздели `total` на `count`.", "Для округления есть `round(число, знаков)`.", "`return round(total / count, 1)`"]),
])

topic("strings", "Строки и f-строки", ["strings", "fstrings"],
      "Строка — последовательность символов, нумерация с нуля. Срез `s[a:b]` берёт символы с a до b, не включая b. "
      "Методы `lower()`, `upper()`, `strip()`, `split()` возвращают новую строку или список. f-строка подставляет значения в `{}`.", [
    P("""
word = "Nevermore"
print(word[0], word[-1], word[:5])
""", "Нумерация с нуля, `-1` — последний символ, `[:5]` — первые пять символов."),
    P("""
author = "Poe"
print(f"{author.upper()}: {len(author)} letters")
""", "В фигурных скобках f-строки можно писать любые выражения."),
    B("Проверить, есть ли в строке слово «moon», не обращая внимания на регистр.", """
line = "The Moon was a ghostly galleon"
found = "moon" in line.lower()
print(found)
""", 1, 'found = "moon" in line',
      "`in` различает регистр: «Moon» и «moon» — разные строки. Сначала приведи строку к нижнему регистру."),
    B("Убрать пробелы по краям и напечатать длину строки.", """
line = "  Hope is the thing with feathers  "
clean = line.strip()
print(len(clean))
""", 1, "clean = line.strip",
      "Без скобок `strip` — сам метод, а не результат. Методы вызывают со скобками: `strip()`."),
    O("Разбить строку на слова и напечатать первое слово заглавными буквами.", """
line = "because I could not stop for death"
words = line.split()
first = words[0]
print(first.upper())
"""),
    O("Собрать из списка слов одну строку через пробел.", """
words = ["I", "wandered", "lonely"]
line = " ".join(words)
print(line)
"""),
    F("Допиши, чтобы получить список слов.", """
line = "Shall I compare thee"
print(line.⟦split()⟧)
""", "`split()` без аргументов режет строку по пробелам."),
    F("Допиши, чтобы напечатать имя с заглавной буквы.", """
name = "keats"
print(⟦name.capitalize()⟧)
""", "`capitalize()` делает первую букву заглавной, `title()` — первую букву каждого слова."),
    W("Напиши функцию `count_words(line)`: сколько слов в строке.", """
def count_words(line):
    # твой код
    pass
""", """
def count_words(line):
    return len(line.split())
""", [('count_words("Hope is the thing")', "4"), ('count_words("Nevermore")', "1"), ('count_words("")', "0")],
      ["Сначала разбей строку на слова.", "`line.split()` даёт список слов, его длину даёт `len()`.",
       "`return len(line.split())`"]),
    W("Напиши функцию `initials(name)`: инициалы через точки, «Emily Dickinson» → «E.D.».", """
def initials(name):
    # твой код
    pass
""", """
def initials(name):
    result = ""
    for word in name.split():
        result += word[0] + "."
    return result
""", [('initials("Emily Dickinson")', "'E.D.'"), ('initials("Edgar Allan Poe")', "'E.A.P.'"), ('initials("Keats")', "'K.'")],
      ["Пройди циклом по словам: `for word in name.split():`.", "Первая буква слова — `word[0]`. Добавляй к результату её и точку.",
       "Начни с `result = \"\"`, в цикле `result += word[0] + \".\"`, в конце `return result`."]),
])

topic("lists", "Списки", ["lists"],
      "Список хранит значения по порядку: `items[0]` — первый, `items[-1]` — последний, `items[1:3]` — срез. "
      "`append()` и `sort()` меняют сам список и возвращают None, а `sorted()` создаёт новый.", [
    P("""
poets = ["Keats", "Poe", "Whitman"]
poets.append("Dickinson")
print(len(poets), poets[-1])
""", "`append` добавляет элемент в конец списка."),
    P("""
nums = [5, 2, 9]
s = sorted(nums)
nums.sort(reverse=True)
print(s, nums)
""", "`sorted()` возвращает новый список, а `.sort()` меняет сам список."),
    B("Напечатать два последних стихотворения из списка.", """
poems = ["Ozymandias", "The Raven", "Daffodils", "Hope"]
print(poems[-2:])
""", 1, "print(poems[-2])",
      "`[-2]` — один элемент, а срез `[-2:]` — всё от предпоследнего до конца."),
    B("Добавить строку в список и напечатать список.", """
lines = ["Tyger Tyger"]
lines.append("burning bright")
print(lines)
""", 1, 'lines = lines.append("burning bright")',
      "`append` меняет список на месте и возвращает None. Если присвоить результат, список затрётся."),
    O("Посчитать сумму и среднюю длину строк.", """
lengths = [7, 5, 9, 3]
total = sum(lengths)
average = total / len(lengths)
print(total, average)
"""),
    O("Найти самое длинное слово.", """
words = ["hope", "feathers", "soul"]
longest = max(words, key=len)
print(longest)
"""),
    F("Допиши, чтобы напечатать второе слово.", """
words = ["the", "raven", "nevermore"]
print(⟦words[1]⟧)
""", "Нумерация с нуля: второй элемент — `words[1]`."),
    F("Допиши строку, которая отсортирует список.", """
nums = [3, 1, 2]
⟦nums.sort()⟧
print(nums)
""", "`nums.sort()` сортирует сам список. Подойдёт и `nums = sorted(nums)`."),
    W("Напиши функцию `first_and_last(items)`: список из первого и последнего элемента.", """
def first_and_last(items):
    # твой код
    pass
""", """
def first_and_last(items):
    return [items[0], items[-1]]
""", [("first_and_last([1, 2, 3])", "[1, 3]"), ('first_and_last(["a"])', "['a', 'a']"), ('first_and_last(["x", "y"])', "['x', 'y']")],
      ["Первый элемент — `items[0]`, последний — `items[-1]`.", "Собери их в новый список квадратными скобками.",
       "`return [items[0], items[-1]]`"]),
    W("Напиши функцию `without_first(items)`: новый список без первого элемента. Исходный список менять нельзя.", """
def without_first(items):
    # твой код
    pass
""", """
def without_first(items):
    return items[1:]
""", [("without_first([1, 2, 3])", "[2, 3]"), ("without_first([1])", "[]"), ("without_first([])", "[]")],
      ["Срез создаёт новый список и не меняет старый.", "Срез «со второго элемента до конца» — `[1:]`.", "`return items[1:]`"]),
])

topic("conditions", "Условия", ["conditions"],
      "`if` выполняет блок, если условие истинно. `elif` и `else` проверяются сверху вниз, срабатывает первая подходящая ветка. "
      "Сравнение — `==`, а `=` — присваивание. Условия соединяют `and` и `or`.", [
    P("""
n = 7
if n > 10:
    print("long")
elif n > 5:
    print("medium")
else:
    print("short")
""", "Python проверяет условия сверху вниз и выполняет первую подходящую ветку."),
    P("""
word = ""
if word:
    print("есть слово")
else:
    print("пусто")
""", "Пустая строка, 0, пустой список и None считаются ложью."),
    B("Напечатать «sonnet», если в стихотворении ровно 14 строк.", """
lines = 14
if lines == 14:
    print("sonnet")
""", 1, "if lines = 14:",
      "`=` присваивает значение, а сравнивает `==`."),
    B("Слово короткое, если в нём от 1 до 3 букв.", """
word = "feathers"
if len(word) > 0 and len(word) < 4:
    print("short")
else:
    print("long")
""", 1, "if len(word) > 0 or len(word) < 4:",
      "`or` истинно, если верно хотя бы одно условие. Здесь нужны оба сразу — это `and`."),
    O("Напечатать, чётное ли число строк.", """
lines = 9
if lines % 2 == 0:
    print("even")
else:
    print("odd")
"""),
    O("Определить автора по слову.", """
word = "nevermore"
author = "unknown"
if word == "nevermore":
    author = "Poe"
print(author)
"""),
    F("Допиши условие: «pass», если оценка не меньше 0.5.", """
score = 0.8
label = "pass" if ⟦score >= 0.5⟧ else "fail"
print(label)
""", "«Не меньше» — это `>=`."),
    F("Допиши условие: стихотворение написано раньше 1900 года.", """
year = 1819
if ⟦year < 1900⟧:
    print("19th century or earlier")
""", "«Раньше» — значит год меньше: `<`."),
    W("Напиши функцию `poem_size(lines)`: «short», если строк меньше 8; «medium» — от 8 до 20 включительно; иначе «long».", """
def poem_size(lines):
    # твой код
    pass
""", """
def poem_size(lines):
    if lines < 8:
        return "short"
    elif lines <= 20:
        return "medium"
    else:
        return "long"
""", [("poem_size(4)", "'short'"), ("poem_size(8)", "'medium'"), ("poem_size(20)", "'medium'"), ("poem_size(21)", "'long'")],
      ["Три ветки: `if`, `elif`, `else`.", "Сначала проверь `lines < 8`, потом `lines <= 20`.",
       "Во второй ветке не нужно проверять `lines >= 8`: до неё доходим, только если первое условие ложно."]),
    W("Напиши функцию `is_sonnet(lines)`: True, если строк ровно 14, иначе False.", """
def is_sonnet(lines):
    # твой код
    pass
""", """
def is_sonnet(lines):
    return lines == 14
""", [("is_sonnet(14)", "True"), ("is_sonnet(13)", "False"), ("is_sonnet(0)", "False")],
      ["Сравнение `==` уже даёт True или False.", "`if` здесь не нужен: можно вернуть результат сравнения.", "`return lines == 14`"]),
])

topic("loops", "Циклы", ["loops"],
      "`for` проходит по элементам списка, строки или `range()`. `range(a, b)` — числа от a до b, не включая b. "
      "Чтобы копить результат, переменную создают до цикла и меняют внутри: `total += x`.", [
    P("""
total = 0
for n in [3, 4, 5]:
    total += n
print(total)
""", "`total += n` прибавляет каждое число к сумме: 3 + 4 + 5."),
    P("""
for i in range(1, 4):
    print(i * "*")
""", "Строку можно умножить на число: `2 * \"*\"` — это `\"**\"`."),
    B("Напечатать номера строк от 1 до 3.", """
for i in range(1, 4):
    print(i)
""", 0, "for i in range(3):",
      "`range(3)` — это 0, 1, 2. Начало по умолчанию 0, а конец не входит."),
    B("Сложить длины всех слов.", """
words = ["hope", "is", "the"]
total = 0
for w in words:
    total += len(w)
print(total)
""", 3, "    total = len(w)",
      "`=` каждый раз перезаписывает сумму. Чтобы копить, нужно `+=`."),
    O("Посчитать, сколько слов длиннее трёх букв.", """
words = ["the", "raven", "said", "nevermore"]
count = 0
for w in words:
    if len(w) > 3:
        count += 1
print(count)
"""),
    O("Пронумеровать строки, начиная с единицы.", """
lines = ["Tyger Tyger", "burning bright"]
for i, line in enumerate(lines, start=1):
    print(i, line)
"""),
    F("Допиши, чтобы получился обратный отсчёт от 5 до 1.", """
for i in ⟦range(5, 0, -1)⟧:
    print(i)
""", "Третий аргумент `range` — шаг. С шагом -1 числа идут вниз, а конец, 0, не входит."),
    F("Допиши строку, которая копит сумму чисел от 1 до 4.", """
total = 0
for n in range(1, 5):
    ⟦total += n⟧
print(total)
""", "`total += n` — то же, что `total = total + n`."),
    W("Напиши функцию `count_long(words, n)`: сколько слов длиннее `n` букв.", """
def count_long(words, n):
    # твой код
    pass
""", """
def count_long(words, n):
    count = 0
    for w in words:
        if len(w) > n:
            count += 1
    return count
""", [('count_long(["a", "bb", "ccc"], 1)', "2"), ("count_long([], 3)", "0"), ('count_long(["raven", "the"], 3)', "1")],
      ["Заведи счётчик `count = 0` до цикла.", "В цикле проверь `if len(w) > n:` и увеличь счётчик.",
       "После цикла верни `count`. Следи, чтобы `return` стоял без отступа цикла."]),
    W("Напиши функцию `longest_line(lines)`: номер самой длинной строки, считая с 1. Если длинных несколько — первой из них.", """
def longest_line(lines):
    # твой код
    pass
""", """
def longest_line(lines):
    best = 0
    for i in range(len(lines)):
        if len(lines[i]) > len(lines[best]):
            best = i
    return best + 1
""", [('longest_line(["a", "bbb", "cc"])', "2"), ('longest_line(["xx", "yy"])', "1"), ('longest_line(["one"])', "1")],
      ["Запоминай номер лучшей строки: `best = 0`.", "Меняй `best`, только если новая строка строго длиннее: `>` , а не `>=`.",
       "Номера в Python с нуля, а ответ нужен с единицы: верни `best + 1`."]),
])

topic("dicts", "Словари и множества", ["dicts", "sets"],
      "Словарь хранит пары «ключ → значение»: `d[key]`. Если ключа может не быть, используй `d.get(key, 0)`. "
      "Множество хранит только разные значения: `set(words)` убирает повторы.", [
    P("""
counts = {"hope": 2, "soul": 1}
counts["hope"] += 1
counts["bird"] = 1
print(counts)
""", "Присваивание по новому ключу добавляет пару, по старому — меняет значение."),
    P("""
words = ["the", "sea", "the", "sky", "sea"]
print(len(words), len(set(words)))
""", "Во множестве каждое значение встречается один раз."),
    B("Узнать, сколько раз встретилось слово, даже если его нет в словаре.", """
counts = {"moon": 3}
print(counts.get("sun", 0))
""", 1, 'print(counts["sun"])',
      "Обращение по несуществующему ключу даёт KeyError. `get(key, 0)` вернёт 0."),
    B("Посчитать, сколько раз встречается каждое слово.", """
words = ["sea", "sky", "sea"]
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)
""", 3, "    counts[w] = 1",
      "Так каждое слово всегда получает 1. Нужно взять старое значение и прибавить 1."),
    O("Найти слова, которые есть в обеих строках.", """
a = set("the sea and the sky".split())
b = set("the moon and the stars".split())
common = a & b
print(sorted(common))
"""),
    O("Перебрать словарь и напечатать пары.", """
years = {"Keats": 1795, "Poe": 1809}
for name, year in years.items():
    print(name, year)
"""),
    F("Допиши, чтобы напечатать год рождения По.", """
born = {"Keats": 1795, "Poe": 1809}
print(born⟦["Poe"]⟧)
""", "Значение достают по ключу в квадратных скобках."),
    F("Допиши строку, которая добавляет слово во множество.", """
seen = set()
for w in ["sea", "sky", "sea"]:
    ⟦seen.add(w)⟧
print(len(seen))
""", "У множества метод `add`. Повтор «sea» не добавится."),
    W("Напиши функцию `word_counts(words)`: словарь «слово → сколько раз встретилось».", """
def word_counts(words):
    # твой код
    pass
""", """
def word_counts(words):
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    return counts
""", [('word_counts(["a", "b", "a"])', "{'a': 2, 'b': 1}"), ("word_counts([])", "{}")],
      ["Начни с пустого словаря `counts = {}`.", "Для каждого слова: `counts[w] = counts.get(w, 0) + 1`.", "После цикла `return counts`."]),
    W("Напиши функцию `unique_count(text)`: сколько разных слов в тексте, без учёта регистра.", """
def unique_count(text):
    # твой код
    pass
""", """
def unique_count(text):
    return len(set(text.lower().split()))
""", [('unique_count("The sea the Sea")', "2"), ('unique_count("")', "0"), ('unique_count("Hope")', "1")],
      ["Приведи текст к нижнему регистру и разбей на слова.", "Множество из списка уберёт повторы.",
       "`return len(set(text.lower().split()))`"]),
])

topic("functions", "Функции", ["functions", "modules"],
      "Функция — именованный кусок кода: `def name(params):`. `return` возвращает результат и завершает функцию. "
      "Если `return` нет, функция возвращает None. У параметра может быть значение по умолчанию.", [
    P("""
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Emily"))
print(greet("Edgar", "Hi"))
""", "Если аргумент не передан, берётся значение по умолчанию."),
    P("""
def double(x):
    print(x * 2)

result = double(4)
print(result)
""", "`print` показывает значение, а `return` возвращает его. Функция без `return` возвращает None."),
    B("Функция должна вернуть число строк, а программа — умножить его на 10.", """
def count_lines(text):
    return len(text.splitlines())

print(count_lines("one\\ntwo\\nthree") * 10)
""", 1, "    len(text.splitlines())",
      "Без `return` функция возвращает None, а None нельзя умножить на число."),
    B("Функция складывает длины всех слов.", """
def total_length(words):
    total = 0
    for w in words:
        total += len(w)
    return total

print(total_length(["sea", "sky"]))
""", 4, "        return total",
      "`return` внутри цикла завершает функцию на первом же слове. Он должен стоять после цикла."),
    O("Функция возвращает слова длиннее трёх букв.", """
def long_words(words):
    result = []
    for w in words:
        if len(w) > 3:
            result.append(w)
    return result
print(long_words(["the", "raven", "said"]))
"""),
    O("Посчитать площадь прямоугольника через функцию.", """
def area(width, height):
    return width * height
size = area(3, 4)
print(size)
"""),
    F("Допиши тело функции: текст заглавными буквами и восклицательный знак в конце.", """
def shout(text):
    ⟦return text.upper() + "!"⟧

print(shout("nevermore"))
""", "Функция должна вернуть результат через `return`."),
    F("Допиши аргументы, чтобы получилось «Keats (1795)».", """
def describe(name, year):
    return f"{name} ({year})"

print(describe(⟦"Keats", 1795⟧))
""", "Аргументы передаются в том же порядке, что и параметры."),
    W("Напиши функцию `rhyme(a, b)`: True, если слова оканчиваются на одинаковые две буквы.", """
def rhyme(a, b):
    # твой код
    pass
""", """
def rhyme(a, b):
    return a[-2:] == b[-2:]
""", [('rhyme("night", "light")', "True"), ('rhyme("sea", "sky")', "False"), ('rhyme("moon", "soon")', "True")],
      ["Последние две буквы слова — срез `[-2:]`.", "Сравни срезы двух слов.", "`return a[-2:] == b[-2:]`"]),
    W("Напиши функцию `top_word(words)`: самое частое слово. Если таких несколько — то, что встретилось раньше.", """
def top_word(words):
    # твой код
    pass
""", """
def top_word(words):
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    best = words[0]
    for w in words:
        if counts[w] > counts[best]:
            best = w
    return best
""", [('top_word(["a", "b", "b"])', "'b'"), ('top_word(["x", "y"])', "'x'"), ('top_word(["sea", "sky", "sky", "sea"])', "'sea'")],
      ["Сначала посчитай слова в словарь, как в теме про словари.", "Потом пройди по словам по порядку и запоминай лучшее.",
       "Меняй лучшее, только если новое встречается строго чаще: так при равенстве останется то, что было раньше."]),
])

topic("comprehensions", "Генераторы списков", ["comprehensions"],
      "Генератор списка собирает новый список в одну строку: `[выражение for x in список if условие]`. "
      "Так же собирают словари: `{ключ: значение for x in список}`.", [
    P("""
words = ["sea", "moon", "stars"]
print([len(w) for w in words])
""", "Выражение слева применяется к каждому элементу."),
    P("""
words = ["the", "raven", "a", "door"]
print([w.upper() for w in words if len(w) > 3])
""", "Условие справа отбирает элементы, выражение слева их меняет."),
    B("Квадраты чисел от 1 до 3.", """
nums = range(1, 4)
squares = [n * n for n in nums]
print(squares)
""", 0, "nums = range(3)",
      "`range(3)` начинается с нуля: 0, 1, 2."),
    B("Словарь «слово → длина».", """
words = ["sea", "moon"]
lengths = {w: len(w) for w in words}
print(lengths)
""", 1, "lengths = {len(w): w for w in words}",
      "В словарном генераторе слева от двоеточия ключ, справа значение."),
    O("Привести слова к нижнему регистру и оставить короткие.", """
words = ["Hope", "is", "the", "thing"]
lower = [w.lower() for w in words]
short = [w for w in lower if len(w) <= 3]
print(short)
"""),
    O("Оставить стихотворения длиннее 20 строк.", """
poems = {"Raven": 108, "Hope": 12, "Daffodils": 24}
long = [name for name, n in poems.items() if n > 20]
print(long)
"""),
    F("Допиши: первая буква каждого слова.", """
words = ["sea", "moon", "stars"]
print([⟦w[0]⟧ for w in words])
""", "Первая буква — `w[0]`."),
    F("Допиши условие: только чётные числа.", """
nums = [1, 2, 3, 4, 5, 6]
print([n for n in nums ⟦if n % 2 == 0⟧])
""", "Чётное число делится на 2 без остатка: `n % 2 == 0`."),
    W("Напиши функцию `lengths(words)`: список длин слов. Попробуй одной строкой через генератор.", """
def lengths(words):
    # твой код
    pass
""", """
def lengths(words):
    return [len(w) for w in words]
""", [('lengths(["a", "bb"])', "[1, 2]"), ("lengths([])", "[]")],
      ["Шаблон: `[выражение for w in words]`.", "Выражение здесь — `len(w)`.", "`return [len(w) for w in words]`"]),
    W("Напиши функцию `capitalized(words)`: только слова, которые начинаются с заглавной буквы.", """
def capitalized(words):
    # твой код
    pass
""", """
def capitalized(words):
    return [w for w in words if w[:1].isupper()]
""", [('capitalized(["Hope", "is", "The"])', "['Hope', 'The']"), ('capitalized(["a"])', "[]"), ('capitalized(["", "Sea"])', "['Sea']")],
      ["Нужен генератор с условием `if`.", "Проверить заглавную букву помогает метод `isupper()`.",
       "Для пустой строки `w[0]` даст ошибку, а `w[:1]` — нет: `[w for w in words if w[:1].isupper()]`."]),
])

topic("errors", "Ошибки и исключения", ["errors"],
      "`try` выполняет код, а `except Тип:` ловит ошибку этого типа. Ловить нужно ту ошибку, которая действительно возникает. "
      "`raise` сообщает об ошибке сам. Подробнее о типичных ошибках — в разборе ошибок.", [
    P("""
try:
    n = int("fourteen")
except ValueError:
    n = 0
print(n)
""", "`int(\"fourteen\")` даёт ValueError, поэтому выполняется ветка `except`."),
    P("""
def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

print(safe_div(6, 3), safe_div(1, 0))
""", "Делить на ноль нельзя: вторая попытка попадает в `except`."),
    B("Если стихотворения нет в словаре, напечатать «unknown».", """
authors = {"Raven": "Poe"}
try:
    print(authors["Hope"])
except KeyError:
    print("unknown")
""", 3, "except IndexError:",
      "В словаре нет ключа — это KeyError. IndexError бывает у списков, поэтому ошибка не поймана."),
    B("Превратить строки в числа, пропуская неправильные.", """
values = ["14", "x", "3"]
nums = []
for v in values:
    try:
        nums.append(int(v))
    except ValueError:
        pass
print(nums)
""", 5, "    except TypeError:",
      "`int(\"x\")` даёт ValueError, а не TypeError, поэтому ошибка не поймана."),
    O("Превратить текст в число, а если не выходит — в None.", """
text = "12 lines"
try:
    n = int(text)
except ValueError:
    n = None
print(n)
"""),
    O("Функция сообщает об ошибке, если строк меньше одной.", """
def check_lines(n):
    if n <= 0:
        raise ValueError("lines must be positive")
    return n
print(check_lines(14))
"""),
    F("Допиши тип ошибки, которая возникает при номере за пределами списка.", """
try:
    x = [1, 2, 3][5]
except ⟦IndexError⟧:
    x = -1
print(x)
""", "Номер за пределами списка — IndexError."),
    F("Допиши строку: если год не число, функция возвращает 0.", """
def parse_year(text):
    try:
        return int(text)
    except ValueError:
        ⟦return 0⟧

print(parse_year("1819"), parse_year("unknown"))
""", "Ветка `except` выполняется, когда `int()` не смог превратить текст в число."),
    W("Напиши функцию `to_int(text)`: число из строки или None, если превратить не получается.", """
def to_int(text):
    # твой код
    pass
""", """
def to_int(text):
    try:
        return int(text)
    except ValueError:
        return None
""", [('to_int("14")', "14"), ('to_int("x")', "None"), ('to_int("-3")', "-3")],
      ["Оберни `int(text)` в `try`.", "Неправильная строка даёт ValueError.", "В `except ValueError:` верни `None`."]),
    W("Напиши функцию `safe_get(items, i)`: элемент с номером `i` или None, если такого номера нет.", """
def safe_get(items, i):
    # твой код
    pass
""", """
def safe_get(items, i):
    try:
        return items[i]
    except IndexError:
        return None
""", [("safe_get([1, 2], 1)", "2"), ("safe_get([1, 2], 5)", "None"), ("safe_get([], 0)", "None")],
      ["Обращение по номеру за пределами списка даёт IndexError.", "Поймай её через `try` / `except IndexError:`.",
       "В `except` верни `None`."]),
])

topic("classes", "Классы и файлы", ["classes", "files"],
      "Класс описывает объект: данные в `self` и методы. Первый параметр метода — `self`. "
      "Файлы открывают через `with open(путь, режим, encoding=\"utf-8\")`: \"w\" — записать, без режима — прочитать.", [
    P("""
class Poem:
    def __init__(self, title, lines):
        self.title = title
        self.lines = lines

    def size(self):
        return len(self.lines)

p = Poem("Hope", ["Hope is the thing", "with feathers"])
print(p.title, p.size())
""", "`__init__` сохраняет данные в объект, метод `size` читает их через `self`."),
    P("""
with open("note.txt", "w", encoding="utf-8") as f:
    f.write("line one\\nline two\\n")

with open("note.txt", encoding="utf-8") as f:
    print(len(f.readlines()))
""", "`readlines()` возвращает список строк файла."),
    B("Метод должен вернуть название заглавными буквами.", """
class Poem:
    def __init__(self, title):
        self.title = title

    def loud(self):
        return self.title.upper()

print(Poem("Raven").loud())
""", 4, "    def loud():",
      "Первый параметр метода — `self`: Python сам передаёт в него объект."),
    B("Записать строку в файл и прочитать её.", """
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("Nevermore")

with open("out.txt", encoding="utf-8") as f:
    print(f.read())
""", 0, 'with open("out.txt", "r", encoding="utf-8") as f:',
      "Режим \"r\" — только чтение, а файла ещё нет. Чтобы записать, нужен режим \"w\"."),
    O("Класс поэта с методом подписи.", """
class Poet:
    def __init__(self, name):
        self.name = name
    def sign(self):
        return "— " + self.name
print(Poet("Keats").sign())
"""),
    O("Записать две строки в файл и прочитать вторую.", """
lines = ["Tyger Tyger", "burning bright"]
with open("tyger.txt", "w", encoding="utf-8") as f:
    f.write("\\n".join(lines))
with open("tyger.txt", encoding="utf-8") as f:
    print(f.read().split("\\n")[1])
"""),
    F("Допиши строку в `__init__`, которая сохраняет название.", """
class Poem:
    def __init__(self, title):
        ⟦self.title = title⟧

print(Poem("Ozymandias").title)
""", "Данные объекта хранятся в `self`."),
    F("Допиши: прочитать файл и разбить его на слова.", """
with open("words.txt", "w", encoding="utf-8") as f:
    f.write("sea\\nsky\\n")

with open("words.txt", encoding="utf-8") as f:
    words = ⟦f.read().split()⟧
print(words)
""", "`read()` возвращает весь текст, `split()` режет его по пробелам и переносам строк."),
    W("Допиши метод `word_count()`: сколько слов во всех строках стихотворения.", """
class Poem:
    def __init__(self, title, lines):
        self.title = title
        self.lines = lines

    def word_count(self):
        # твой код
        pass
""", """
class Poem:
    def __init__(self, title, lines):
        self.title = title
        self.lines = lines

    def word_count(self):
        total = 0
        for line in self.lines:
            total += len(line.split())
        return total
""", [('Poem("A", ["a b", "c"]).word_count()', "3"), ('Poem("B", []).word_count()', "0")],
      ["Строки лежат в `self.lines`.", "Для каждой строки прибавляй `len(line.split())`.",
       "Начни с `total = 0`, после цикла `return total`."]),
    W("Напиши функцию `count_lines(path)`: сколько непустых строк в файле.", """
def count_lines(path):
    # твой код
    pass
""", """
def count_lines(path):
    with open(path, encoding="utf-8") as f:
        return len([line for line in f if line.strip()])
""", [('count_lines("poem1.txt")', "2"), ('count_lines("poem2.txt")', "3")],
      ["Открой файл: `with open(path, encoding=\"utf-8\") as f:`.", "Строка пустая, если `line.strip()` даёт пустую строку.",
       "`return len([line for line in f if line.strip()])`"],
      setup="""
with open("poem1.txt", "w", encoding="utf-8") as f:
    f.write("Hope is the thing\\n\\nwith feathers\\n")
with open("poem2.txt", "w", encoding="utf-8") as f:
    f.write("one\\ntwo\\nthree")
"""),
])

# ---------- more content (tools/trainer_more.py) ----------

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import trainer_more  # noqa: E402

trainer_more.add_content(topic, P, B, O, F, W)
_EXTRA = trainer_more.extra_tasks(P, B, O, F, W)
for _tp in TOPICS:
    _tp["tasks"].extend(_EXTRA.get(_tp["id"], []))
ORDER = ["basics", "strings", "formatting", "lists", "conditions", "loops", "zipenum", "dicts", "nested",
         "functions", "sorting", "comprehensions", "errors", "classes"]
assert sorted(ORDER) == sorted(tp["id"] for tp in TOPICS)
TOPICS.sort(key=lambda tp: ORDER.index(tp["id"]))


# ---------- step-by-step trace for "read the code" tasks ----------

TRACE_LIMIT = 80


def short_value(v):
    if isinstance(v, types.ModuleType):
        return None
    if isinstance(v, (types.FunctionType, types.BuiltinFunctionType, types.MethodType)):
        return "функция"
    if isinstance(v, type):
        return "класс"
    if type(v).__module__ == "__main__" and hasattr(v, "__dict__"):
        fields = ", ".join("%s=%r" % kv for kv in vars(v).items())
        r = "%s(%s)" % (type(v).__name__, fields)
    else:
        r = repr(v)
    return r if len(r) <= 60 else r[:57] + "..."


def snapshot(names):
    out = []
    for k, v in list(names.items()):
        if k.startswith("__") or k.startswith("."):
            continue
        s = short_value(v)
        if s is not None:
            out.append([k, s])
    return out


def scope_name(code):
    name = code.co_name
    if name == "<module>":
        return ""
    if name == "<lambda>":
        return "lambda"
    if name == "<genexpr>":
        return "генератор"
    return name


CO_OPTIMIZED = 1


def trace(code):
    """Steps of execution: the line about to run, variables before it, output so far.
    Class bodies are skipped (only def lines run there); a function's return value is its own step."""
    steps = []
    out = io.StringIO()
    g = {"__name__": "__main__"}
    full = [False]
    failed = set()

    def add(step):
        if len(steps) >= TRACE_LIMIT:
            full[0] = True
            return
        steps.append(step)

    def local(frame, event, arg):
        base = {"line": frame.f_lineno - 1, "scope": scope_name(frame.f_code),
                "vars": snapshot(frame.f_locals), "out": out.getvalue()}
        if event == "line":
            add(base)
        elif event == "exception":
            failed.add(id(frame))
        elif event == "return" and frame.f_code.co_name not in ("<module>", "<genexpr>"):
            if id(frame) in failed:
                failed.discard(id(frame))
            else:
                base["ret"] = short_value(arg) or "функция"
                add(base)
        return local

    def tracer(frame, event, arg):
        c = frame.f_code
        if c.co_filename != "<task>":
            return None
        if c.co_name != "<module>" and not c.co_flags & CO_OPTIMIZED:
            return None  # class body
        return local(frame, event, arg)

    old = os.getcwd()
    with tempfile.TemporaryDirectory() as tmp:
        os.chdir(tmp)
        try:
            with contextlib.redirect_stdout(out):
                sys.settrace(tracer)
                try:
                    exec(compile(code, "<task>", "exec"), g)
                finally:
                    sys.settrace(None)
        finally:
            os.chdir(old)
    steps.append({"line": -1, "scope": "", "vars": snapshot(g), "out": out.getvalue()})
    return {"steps": steps, "cut": full[0]}


# ---------- error guide ----------

TRACEBACK_EXAMPLE = '''
def average(lengths):
    return sum(lengths) / len(lengths)

poems = []
print(average(poems))
'''

ERRORS = [
    ("SyntaxError", "Код записан не по правилам Python, и он даже не начал выполняться.",
     'lines = 14\nif lines == 14\n    print("sonnet")', 'lines = 14\nif lines == 14:\n    print("sonnet")',
     "Чаще всего не хватает двоеточия после `if`, `for`, `def`, скобки или кавычки. Смотри на строку, которую указал Python, и на строку перед ней."),
    ("IndentationError", "Сбились отступы: Python по ним понимает, какие строки внутри `if`, `for` и `def`.",
     'for w in ["sea", "sky"]:\nprint(w)', 'for w in ["sea", "sky"]:\n    print(w)',
     "Строки внутри блока сдвигают на 4 пробела. Не смешивай пробелы и табуляцию."),
    ("NameError", "Python не знает такого имени: переменная не создана или в названии опечатка.",
     'title = "Ozymandias"\nprint(tilte)', 'title = "Ozymandias"\nprint(title)',
     "Проверь написание и то, что переменная создана выше по коду. Python различает регистр: `Title` и `title` — разные имена."),
    ("TypeError", "Действие применено к значению неподходящего типа.",
     'lines = 14\nprint("Lines: " + lines)', 'lines = 14\nprint("Lines: " + str(lines))',
     "Строку нельзя сложить с числом. Преврати число в строку через `str()` или используй f-строку: `f\"Lines: {lines}\"`."),
    ("ValueError", "Тип подходит, а значение — нет.",
     'n = int("fourteen")', 'n = int("14")',
     "`int()` превращает в число только строку из цифр. Если данные могут быть неправильными, оберни в `try` / `except ValueError`."),
    ("IndexError", "Номер элемента за пределами списка или строки.",
     'poets = ["Keats", "Poe"]\nprint(poets[2])', 'poets = ["Keats", "Poe"]\nprint(poets[1])',
     "Нумерация с нуля: у списка из двух элементов номера 0 и 1. Последний элемент всегда `[-1]`."),
    ("KeyError", "В словаре нет такого ключа.",
     'born = {"Keats": 1795}\nprint(born["Poe"])', 'born = {"Keats": 1795}\nprint(born.get("Poe", "unknown"))',
     "Проверь написание ключа. Если ключа может не быть, используй `get(ключ, запасное_значение)`."),
    ("AttributeError", "У объекта нет такого метода или поля.",
     'words = ["sea", "sky"]\nprint(words.lower())', 'words = ["sea", "sky"]\nprint([w.lower() for w in words])',
     "Сообщение называет тип объекта: здесь у списка нет метода `lower`, он есть у строки. Проверь, что за значение в переменной."),
    ("ZeroDivisionError", "Деление на ноль.",
     'lengths = []\nprint(sum(lengths) / len(lengths))', 'lengths = []\nprint(sum(lengths) / len(lengths) if lengths else 0)',
     "Перед делением проверь, что делитель не ноль, — часто это пустой список."),
    ("FileNotFoundError", "Файла по такому пути нет.",
     'with open("poems.csv", encoding="utf-8") as f:\n    print(f.read())', None,
     "Проверь имя файла и папку, из которой запускаешь программу: путь считается от неё. Команда `ls` (в Windows `dir`) покажет, что лежит в папке."),
    ("ModuleNotFoundError", "Python не нашёл библиотеку: в названии опечатка или она не установлена.",
     'import pandsa', 'import pandas',
     "Проверь название. Если оно верное, установи библиотеку в окружение проекта: `pip install pandas`, и убедись, что окружение включено."),
]


def last_line(err):
    return err


def build_errors():
    items = []
    for name, meaning, broken, fixed, how in ERRORS:
        out, err = run(broken)
        assert err and err.startswith(name + ":") or err == name, (name, err)
        entry = {"name": name, "meaning": meaning, "code": broken, "message": err, "how": how}
        if fixed:
            fout, ferr = run(fixed)
            assert ferr is None, (name, ferr)
            entry["fixed"] = fixed
            entry["fixedOut"] = norm(fout)
        items.append(entry)
    # real traceback of a small program saved as poem.py: only its own frames, as in a terminal
    code = TRACEBACK_EXAMPLE.strip("\n")
    src = code.splitlines()
    try:
        exec(compile(code, "poem.py", "exec"), {"__name__": "__main__"})
    except Exception as e:
        frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "poem.py"]
        lines = ["Traceback (most recent call last):"]
        for f in frames:
            lines.append('  File "poem.py", line %d, in %s' % (f.lineno, f.name))
            lines.append("    " + src[f.lineno - 1].strip())
        lines.append("%s: %s" % (type(e).__name__, e))
        tb_text = "\n".join(lines)
    return {"traceback": {"code": code, "text": tb_text}, "items": items}


# ---------- verification ----------

def tests_literal(tests):
    return "_TESTS = " + repr([(c, e) for c, e in tests]) + "\n"


def run_tests(code, setup, tests):
    program = code + "\n\n" + setup + "\n" + tests_literal(tests) + HARNESS
    out, err = run(program)
    if err:
        return None, err
    marker = out.rfind("@@RESULTS@@")
    return json.loads(out[marker + len("@@RESULTS@@"):]), None


def build_task(t, tid, i):
    task = dict(t)
    task["id"] = "%s.%d" % (tid, i + 1)
    kind = t["type"]
    if kind == "predict":
        out, err = run(t["code"])
        assert err is None, (task["id"], err)
        task["expected"] = norm(out)
        task["trace"] = trace(t["code"])
        assert task["trace"]["steps"][-1]["out"] == out, task["id"]
    elif kind == "bug":
        lines = t["code"].split("\n")
        out, err = run(t["code"])
        assert err is None, (task["id"], err)
        broken = lines[:]
        assert broken[t["line"]] != t["broken"], task["id"]
        task["fixedLine"] = broken[t["line"]]
        broken[t["line"]] = t["broken"]
        bout, berr = run("\n".join(broken))
        assert berr or norm(bout) != norm(out), (task["id"], "broken code gives the same result")
        task["lines"] = broken
        task["bugLine"] = t["line"]
        task["expected"] = norm(out)
        if berr:
            task["actual"] = berr
            task["actualError"] = True
        else:
            task["actual"] = norm(bout) or "(ничего)"
        del task["code"], task["line"], task["broken"]
    elif kind == "order":
        lines = [l for l in t["code"].split("\n") if l.strip()]
        assert len(lines) <= 7, task["id"]
        out, err = run("\n".join(lines))
        assert err is None, (task["id"], err)
        valid = []
        for perm in itertools.permutations(range(len(lines))):
            pout, perr = run("\n".join(lines[j] for j in perm))
            if perr is None and norm(pout) == norm(out):
                valid.append(list(perm))
        task["lines"] = lines
        task["expected"] = norm(out)
        task["valid"] = valid
        del task["code"]
    elif kind == "fill":
        gaps = GAP.findall(t["code"])
        assert len(gaps) == 1, task["id"]
        full = GAP.sub(lambda m: m.group(1), t["code"])
        out, err = run(full)
        assert err is None, (task["id"], err)
        empty_out, empty_err = run(GAP.sub("None", t["code"]))
        assert empty_err or norm(empty_out) != norm(out), (task["id"], "gap is not needed")
        lines = t["code"].split("\n")
        li = next(k for k, l in enumerate(lines) if "⟦" in l)
        m = GAP.search(lines[li])
        task["lines"] = [GAP.sub("", l) for l in lines]
        task["gapLine"] = li
        task["before"] = lines[li][:m.start()]
        task["after"] = lines[li][m.end():]
        task["answer"] = m.group(1)
        task["expected"] = norm(out)
        del task["code"]
    elif kind == "write":
        res, err = run_tests(t["solution"], t["setup"], t["tests"])
        assert err is None and all(r[2] for r in res), (task["id"], err, res)
        res, err = run_tests(t["starter"], t["setup"], t["tests"])
        assert err or not all(r[2] for r in res), (task["id"], "starter passes")
        assert len(t["hints"]) == 3, task["id"]
        task["testsPy"] = tests_literal(t["tests"])
        task["tests"] = [c for c, _ in t["tests"]]
    return task


def main():
    topics = []
    counts = {}
    for tp in TOPICS:
        assert len(tp["tasks"]) in (10, 15), (tp["id"], len(tp["tasks"]))
        kinds = [t["type"] for t in tp["tasks"]]
        assert all(kinds.count(k) in (2, 3) for k in ("predict", "bug", "order", "fill", "write")), tp["id"]
        tasks = [build_task(t, tp["id"], i) for i, t in enumerate(tp["tasks"])]
        for t in tasks:
            counts[t["type"]] = counts.get(t["type"], 0) + 1
        topics.append({"id": tp["id"], "title": tp["title"], "diag": tp["diag"], "intro": tp["intro"], "tasks": tasks})
    data = {"harness": HARNESS, "topics": topics, "errors": build_errors()}
    js = ("// Создано tools/build_trainer.py: каждая задача проверена запуском в Python 3.13.\n"
          "window.PYTRAINER = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    (ROOT / "python-trainer.js").write_text(js, encoding="utf-8")
    print("Тем: %d, задач: %d %s, ошибок в разборе: %d" % (
        len(topics), sum(len(t["tasks"]) for t in topics), counts, len(data["errors"]["items"])))


if __name__ == "__main__":
    main()
