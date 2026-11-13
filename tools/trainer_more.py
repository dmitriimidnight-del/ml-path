"""More trainer content: four topics common in ML code and five extra tasks for each first topic.
Imported by build_trainer.py; every task is verified the same way."""


def add_content(topic, P, B, O, F, W):
    topic("formatting", "Форматирование чисел", ["fstrings"],
          "В f-строке после двоеточия задают формат: `{x:.2f}` — два знака после точки, `{n:,}` — разделитель тысяч, "
          "`{p:.1%}` — проценты, `{s:<6}` — выровнять по левому краю в поле из 6 символов. Так печатают метрики моделей.", [
        P("""
f1 = 0.87654
print(f"F1: {f1:.2f}")
""", "`.2f` — два знака после точки, с округлением."),
        P("""
share = 0.256
print(f"{share:.1%}", f"{1234567:,}")
""", "`%` умножает на 100 и добавляет знак процента, `,` разделяет тысячи."),
        B("Напечатать точность с тремя знаками после точки.", """
acc = 0.91234
print(f"accuracy = {acc:.3f}")
""", 1, 'print(f"accuracy = {acc:3f}")',
          "Без точки `3f` — это ширина поля, а знаков после точки по умолчанию шесть. Число знаков задают после точки: `.3f`."),
        B("Подставить имя автора в строку.", """
author = "Keats"
print(f"Author: {author}")
""", 1, 'print("Author: {author}")',
          "Без буквы `f` перед кавычками подстановки не будет: напечатаются сами фигурные скобки."),
        O("Напечатать метрики авторов ровными столбцами.", """
scores = {"Keats": 0.91, "Poe": 0.78}
for name, f1 in scores.items():
    print(f"{name:<6}{f1:.2f}")
"""),
        O("Посчитать долю длинных стихотворений и напечатать её в процентах.", """
lengths = [14, 120, 30, 8]
long = [n for n in lengths if n > 20]
share = len(long) / len(lengths)
print(f"{share:.0%}")
"""),
        F("Допиши формат: три знака после точки.", """
loss = 0.034567
print(f"loss: {loss⟦:.3f⟧}")
""", "Формат пишут после двоеточия: `:.3f`."),
        F("Допиши формат: разделитель тысяч.", """
n = 1234567
print(f"{n⟦:,⟧} words")
""", "Запятая после двоеточия разделяет тысячи."),
        W("Напиши функцию `percent(part, total)`: доля в процентах с одним знаком, `percent(1, 4)` → `'25.0%'`.", """
def percent(part, total):
    # твой код
    pass
""", """
def percent(part, total):
    return f"{part / total:.1%}"
""", [("percent(1, 4)", "'25.0%'"), ("percent(1, 3)", "'33.3%'"), ("percent(0, 5)", "'0.0%'")],
          ["Сначала доля: `part / total`.", "Формат процентов с одним знаком — `:.1%`.", "`return f\"{part / total:.1%}\"`"]),
        W("Напиши функцию `report(name, score)`: строка вида `'Keats: 0.91'` — оценка с двумя знаками.", """
def report(name, score):
    # твой код
    pass
""", """
def report(name, score):
    return f"{name}: {score:.2f}"
""", [('report("Keats", 0.9123)', "'Keats: 0.91'"), ('report("Poe", 1)', "'Poe: 1.00'")],
          ["Нужна f-строка с двумя подстановками.", "Две цифры после точки — формат `:.2f`, он работает и для целых чисел.",
           "`return f\"{name}: {score:.2f}\"`"]),
    ])

    topic("zipenum", "zip, enumerate и распаковка", ["loops"],
          "`enumerate(items, start=1)` даёт пары «номер, элемент». `zip(a, b)` идёт по двум спискам параллельно и останавливается "
          "на самом коротком. Распаковка раскладывает пару по переменным: `a, b = pair`. Кортеж — неизменяемый список в круглых скобках.", [
        P("""
for i, w in enumerate(["sea", "sky"], start=1):
    print(i, w)
""", "`enumerate` даёт номер вместе с элементом, `start=1` — считать с единицы."),
        P("""
names = ["Keats", "Poe", "Blake"]
years = [1795, 1809]
print(list(zip(names, years)))
""", "`zip` останавливается на самом коротком списке, поэтому Блейка нет."),
        B("Напечатать стихотворения рядом с авторами.", """
titles = ["Ozymandias", "The Raven"]
authors = ["Shelley", "Poe"]
for t, a in zip(titles, authors):
    print(t, "-", a)
""", 2, "for t, a in titles, authors:",
          "Без `zip` цикл идёт по двум спискам целиком и раскладывает каждый список на две переменные, а не составляет пары."),
        B("Разложить пару «автор, год» по переменным.", """
pair = ("Poe", 1809)
name, year = pair
print(name, year)
""", 1, "name, year, place = pair",
          "Переменных слева должно быть столько же, сколько значений в кортеже."),
        O("Найти номер самого длинного слова.", """
words = ["sea", "nevermore", "sky"]
best = 0
for i, w in enumerate(words):
    if len(w) > len(words[best]):
        best = i
print(best)
"""),
        O("Сложить два списка поэлементно.", """
a = [1, 2, 3]
b = [10, 20, 30]
sums = [x + y for x, y in zip(a, b)]
print(sums)
"""),
        F("Допиши, чтобы получить номер и значение каждого элемента.", """
scores = [0.7, 0.9]
for i, s in ⟦enumerate(scores)⟧:
    print(i, s)
""", "`enumerate` считает с нуля, если не указать `start`."),
        F("Допиши левую часть: разложи точку на две переменные.", """
point = (3, 4)
⟦x, y⟧ = point
print(x * y)
""", "Распаковка: `x, y = point`."),
        W("Напиши функцию `pairs(names, years)`: список строк вида `'Keats (1795)'` для пар из двух списков.", """
def pairs(names, years):
    # твой код
    pass
""", """
def pairs(names, years):
    return [f"{n} ({y})" for n, y in zip(names, years)]
""", [('pairs(["Keats", "Poe"], [1795, 1809])', "['Keats (1795)', 'Poe (1809)']"), ("pairs([], [])", "[]")],
          ["Пройди по парам: `for n, y in zip(names, years)`.", "Строку собери f-строкой: `f\"{n} ({y})\"`.",
           "Одной строкой: `return [f\"{n} ({y})\" for n, y in zip(names, years)]`"]),
        W("Напиши функцию `numbered(lines)`: список строк вида `'1. текст'`, нумерация с единицы.", """
def numbered(lines):
    # твой код
    pass
""", """
def numbered(lines):
    return [f"{i}. {line}" for i, line in enumerate(lines, start=1)]
""", [('numbered(["Tyger", "burning"])', "['1. Tyger', '2. burning']"), ("numbered([])", "[]")],
          ["Номер и строку даёт `enumerate(lines, start=1)`.", "Строку собери f-строкой: `f\"{i}. {line}\"`.",
           "`return [f\"{i}. {line}\" for i, line in enumerate(lines, start=1)]`"]),
    ])

    topic("nested", "Список словарей", ["dicts", "lists"],
          "Данные из JSON и API обычно выглядят как список словарей: каждый словарь — одна запись. По записям идут циклом, "
          "поле берут по ключу: `poem[\"author\"]`. Так в проекте 1 приходят стихи из PoetryDB.", [
        P("""
poems = [{"title": "Hope", "lines": 12}, {"title": "Raven", "lines": 108}]
print(poems[1]["title"], len(poems))
""", "Сначала номер записи в списке, потом ключ в словаре."),
        P("""
poems = [{"author": "Poe", "lines": 108}, {"author": "Keats", "lines": 14}, {"author": "Poe", "lines": 20}]
total = 0
for p in poems:
    if p["author"] == "Poe":
        total += p["lines"]
print(total)
""", "Цикл проходит по записям, условие отбирает записи По: 108 + 20."),
        B("Напечатать названия всех стихотворений.", """
poems = [{"title": "Hope"}, {"title": "Raven"}]
for p in poems:
    print(p["title"])
""", 2, '    print(poems["title"])',
          "`poems` — список, у него номера, а не ключи. Ключ `\"title\"` есть у каждого словаря `p` внутри списка."),
        B("Собрать словарь «автор → список названий».", """
poems = [("Poe", "Raven"), ("Keats", "Autumn"), ("Poe", "Lenore")]
by_author = {}
for author, title in poems:
    by_author.setdefault(author, []).append(title)
print(by_author)
""", 3, "    by_author[author] = [title]",
          "Присваивание каждый раз создаёт новый список и затирает старый. `setdefault(ключ, [])` берёт существующий список или создаёт пустой."),
        O("Найти самое длинное стихотворение.", """
poems = [{"title": "Hope", "lines": 12}, {"title": "Raven", "lines": 108}]
best = poems[0]
for p in poems:
    if p["lines"] > best["lines"]:
        best = p
print(best["title"])
"""),
        O("Достать из записи список строк и посчитать их.", """
poem = {"title": "Tyger", "lines": ["Tyger Tyger", "burning bright"]}
lines = poem["lines"]
count = len(lines)
print(poem["title"], count)
"""),
        F("Допиши путь к названию второго стихотворения.", """
data = {"author": "Poe", "poems": [{"title": "Raven"}, {"title": "Lenore"}]}
print(data⟦["poems"][1]["title"]⟧)
""", "Идём по уровням: ключ `\"poems\"`, номер 1, ключ `\"title\"`."),
        F("Допиши выражение: список названий.", """
poems = [{"title": "Hope", "lines": 12}, {"title": "Raven", "lines": 108}]
titles = [⟦p["title"]⟧ for p in poems]
print(titles)
""", "Для каждой записи `p` берём `p[\"title\"]`."),
        W("Напиши функцию `titles_by(poems, author)`: названия стихотворений этого автора. "
          "Каждое стихотворение — словарь с ключами `\"title\"` и `\"author\"`.", """
def titles_by(poems, author):
    # твой код
    pass
""", """
def titles_by(poems, author):
    return [p["title"] for p in poems if p["author"] == author]
""", [('titles_by([{"title": "Raven", "author": "Poe"}, {"title": "Autumn", "author": "Keats"}], "Poe")', "['Raven']"),
              ('titles_by([], "Poe")', "[]")],
          ["Пройди по записям и отбери те, где `p[\"author\"] == author`.", "Из подходящих записей возьми `p[\"title\"]`.",
           "`return [p[\"title\"] for p in poems if p[\"author\"] == author]`"]),
        W("Напиши функцию `lines_per_author(poems)`: словарь «автор → сумма строк». "
          "Каждое стихотворение — словарь с ключами `\"author\"` и `\"lines\"`.", """
def lines_per_author(poems):
    # твой код
    pass
""", """
def lines_per_author(poems):
    totals = {}
    for p in poems:
        totals[p["author"]] = totals.get(p["author"], 0) + p["lines"]
    return totals
""", [('lines_per_author([{"author": "Poe", "lines": 108}, {"author": "Keats", "lines": 14}, {"author": "Poe", "lines": 20}])',
               "{'Poe': 128, 'Keats': 14}"), ("lines_per_author([])", "{}")],
          ["Начни с пустого словаря `totals = {}`.", "Для каждой записи прибавляй строки к сумме автора: `totals.get(автор, 0) + p[\"lines\"]`.",
           "В цикле: `totals[p[\"author\"]] = totals.get(p[\"author\"], 0) + p[\"lines\"]`, после цикла `return totals`."]),
    ])

    topic("sorting", "Сортировка, key и lambda", ["functions"],
          "`sorted(items)` возвращает новый отсортированный список. Параметр `key` говорит, по чему сравнивать: `key=len` — по длине. "
          "`lambda x: ...` — короткая функция в одну строку. `reverse=True` — по убыванию.", [
        P("""
words = ["sky", "nevermore", "sea", "moon"]
print(sorted(words, key=len))
""", "При равной длине порядок сохраняется: сортировка в Python устойчивая, поэтому sky стоит раньше sea."),
        P("""
scores = {"Keats": 0.91, "Poe": 0.78, "Blake": 0.85}
best = sorted(scores, key=lambda name: scores[name], reverse=True)
print(best[0], best[-1])
""", "Сортируем ключи словаря по значению, по убыванию: первый — лучший, последний — худший."),
        B("Отсортировать слова по длине.", """
words = ["raven", "a", "sea"]
print(sorted(words, key=len))
""", 1, "print(sorted(words, key=len()))",
          "В `key` передают саму функцию, без скобок: Python сам вызовет её для каждого элемента."),
        B("Отсортировать авторов по убыванию оценки.", """
scores = [("Poe", 0.78), ("Keats", 0.91)]
ranked = sorted(scores, key=lambda pair: pair[1], reverse=True)
print(ranked[0][0])
""", 1, "ranked = sorted(scores, key=lambda pair: pair[1])",
          "Без `reverse=True` сортировка идёт по возрастанию, и первым оказывается худший."),
        O("Найти два самых частых слова.", """
counts = {"sea": 3, "sky": 1, "moon": 5}
top = sorted(counts, key=counts.get, reverse=True)
print(top[:2])
"""),
        O("Отсортировать стихотворения по числу строк.", """
poems = [{"t": "Raven", "n": 108}, {"t": "Hope", "n": 12}]
poems.sort(key=lambda p: p["n"])
names = [p["t"] for p in poems]
print(names)
"""),
        F("Допиши ключ: сортировать без учёта регистра.", """
words = ["Sea", "apple", "Moon"]
print(sorted(words, key=⟦str.lower⟧))
""", "Без ключа заглавные буквы идут раньше строчных. `str.lower` сравнивает слова в нижнем регистре."),
        F("Допиши, по чему сортировать: по году.", """
pairs = [("Poe", 1809), ("Keats", 1795)]
pairs.sort(key=lambda p: ⟦p[1]⟧)
print(pairs[0][0])
""", "Год — второй элемент пары, `p[1]`."),
        W("Напиши функцию `by_length(words)`: слова от самого длинного к самому короткому.", """
def by_length(words):
    # твой код
    pass
""", """
def by_length(words):
    return sorted(words, key=len, reverse=True)
""", [('by_length(["a", "ccc", "bb"])', "['ccc', 'bb', 'a']"), ("by_length([])", "[]")],
          ["Нужна `sorted` с ключом.", "Длина — `key=len`, по убыванию — `reverse=True`.", "`return sorted(words, key=len, reverse=True)`"]),
        W("Напиши функцию `top_n(counts, n)`: `n` самых частых слов из словаря «слово → число», по убыванию.", """
def top_n(counts, n):
    # твой код
    pass
""", """
def top_n(counts, n):
    return sorted(counts, key=counts.get, reverse=True)[:n]
""", [('top_n({"a": 1, "b": 3, "c": 2}, 2)', "['b', 'c']"), ('top_n({"x": 1}, 5)', "['x']")],
          ["Отсортируй ключи словаря по значению: `key=counts.get`.", "По убыванию — `reverse=True`, первые `n` — срез `[:n]`.",
           "`return sorted(counts, key=counts.get, reverse=True)[:n]`"]),
    ])


def extra_tasks(P, B, O, F, W):
    """Five more tasks for each first topic: one per step."""
    return {
        "basics": [
            P("""
a = 10
a += 5
a *= 2
print(a)
""", "`a += 5` — то же, что `a = a + 5`; потом всё умножается на 2."),
            B("Доля длинных строк в процентах: 3 из 12.", """
long_lines = 3
total = 12
print(long_lines / total * 100)
""", 2, "print(long_lines / (total * 100))",
              "Скобки меняют порядок действий: здесь сначала умножили `total` на 100."),
            O("Перевести секунды чтения в минуты и секунды.", """
seconds = 135
minutes = seconds // 60
rest = seconds % 60
print(minutes, rest)
"""),
            F("Допиши выражение: сколько минут займёт чтение 300 слов при скорости 200 слов в минуту.", """
words = 300
per_minute = 200
print(⟦words / per_minute⟧)
""", "Время — количество слов, делённое на скорость."),
            W("Напиши функцию `reading_time(words)`: сколько полных минут нужно на текст при скорости 200 слов в минуту, с округлением вверх.", """
def reading_time(words):
    # твой код
    pass
""", """
def reading_time(words):
    return (words + 199) // 200
""", [("reading_time(200)", "1"), ("reading_time(201)", "2"), ("reading_time(0)", "0"), ("reading_time(450)", "3")],
              ["201 слово — это уже 2 минуты: нужно округлять вверх.", "Есть `math.ceil(x)`: сначала `import math`.",
               "`return math.ceil(words / 200)` после `import math`, или без импорта: `(words + 199) // 200`."]),
        ],
        "strings": [
            P("""
line = "Tyger Tyger, burning bright"
print(line.count("Tyger"), line.find("burning"))
""", "`count` считает вхождения, `find` возвращает номер первого символа найденного куска."),
            B("Заменить все «thee» на «you».", """
line = "I love thee, I need thee"
new = line.replace("thee", "you")
print(new)
""", 1, 'line.replace("thee", "you")',
              "Строки не меняются: `replace` возвращает новую строку, её нужно сохранить в переменную."),
            O("Напечатать первое слово, если оно с заглавной буквы.", """
line = "Hope is the thing"
first = line.split()[0]
if first[0].isupper():
    print(first)
"""),
            F("Допиши, чтобы каждое слово было с заглавной буквы.", """
title = "the raven"
print(⟦title.title()⟧)
""", "`title()` делает заглавной первую букву каждого слова."),
            W("Напиши функцию `is_palindrome(word)`: True, если слово читается одинаково с обеих сторон, без учёта регистра.", """
def is_palindrome(word):
    # твой код
    pass
""", """
def is_palindrome(word):
    w = word.lower()
    return w == w[::-1]
""", [('is_palindrome("Level")', "True"), ('is_palindrome("Poe")', "False"), ('is_palindrome("a")', "True")],
              ["Приведи слово к нижнему регистру.", "Срез `[::-1]` переворачивает строку.", "`w = word.lower()`, затем `return w == w[::-1]`."]),
        ],
        "lists": [
            P("""
a = [1, 2]
b = a
b.append(3)
print(a)
""", "`b = a` не копирует список: обе переменные указывают на один и тот же список. Копия — `a.copy()` или `a[:]`."),
            B("Объединить два списка строк и посчитать строки.", """
first = ["Tyger Tyger"]
second = ["burning bright"]
poem = first + second
print(len(poem))
""", 2, "poem = first.append(second)",
              "`append` возвращает None. Списки склеивает `+` или `extend`."),
            O("Перевернуть список и взять первые два элемента.", """
words = ["a", "b", "c", "d"]
backwards = words[::-1]
print(backwards[:2])
"""),
            F("Допиши: номер элемента 8 в списке.", """
nums = [4, 8, 15]
print(⟦nums.index(8)⟧)
""", "`index` возвращает номер первого найденного элемента."),
            W("Напиши функцию `middle(items)`: средний элемент списка нечётной длины.", """
def middle(items):
    # твой код
    pass
""", """
def middle(items):
    return items[len(items) // 2]
""", [("middle([1, 2, 3])", "2"), ('middle(["a"])', "'a'"), ("middle([1, 2, 3, 4, 5])", "3")],
              ["Номер середины зависит от длины списка.", "Для длины 5 середина — номер 2: `5 // 2`.", "`return items[len(items) // 2]`"]),
        ],
        "conditions": [
            P("""
x = 5
print(x > 3 and x < 10, x < 3 or x == 5, not x == 5)
""", "`and` — оба условия верны, `or` — хотя бы одно, `not` переворачивает значение."),
            B("Сообщить, что Блейка нет в списке авторов.", """
authors = ["Poe", "Keats"]
if "Blake" not in authors:
    print("no Blake")
""", 1, 'if "Blake" in authors:',
              "Нужно условие «нет в списке» — `not in`."),
            O("Поставить оценку по баллу.", """
score = 72
grade = "C"
if score >= 90:
    grade = "A"
elif score >= 70:
    grade = "B"
print(grade)
"""),
            F("Допиши вторую часть условного выражения.", """
lines = 14
kind = "sonnet" if lines == 14 ⟦else "other"⟧
print(kind)
""", "Условное выражение: `значение if условие else другое_значение`."),
            W("Напиши функцию `season(month)`: `'winter'` для 12, 1, 2; `'summer'` для 6, 7, 8; иначе `'other'`.", """
def season(month):
    # твой код
    pass
""", """
def season(month):
    if month in (12, 1, 2):
        return "winter"
    if month in (6, 7, 8):
        return "summer"
    return "other"
""", [("season(1)", "'winter'"), ("season(12)", "'winter'"), ("season(7)", "'summer'"), ("season(4)", "'other'")],
              ["Проверить, входит ли месяц в набор, можно через `in`: `month in (12, 1, 2)`.", "Две проверки и ответ по умолчанию в конце.",
               "`if month in (12, 1, 2): return \"winter\"`, потом так же для лета, в конце `return \"other\"`."]),
        ],
        "loops": [
            P("""
for w in ["sea", "stop", "sky"]:
    if w == "stop":
        break
    print(w)
print("end")
""", "`break` сразу выходит из цикла, поэтому sky не печатается."),
            B("Найти первое слово длиннее четырёх букв.", """
words = ["sea", "raven", "nevermore"]
for w in words:
    if len(w) > 4:
        print(w)
        break
""", 4, "        continue",
              "`continue` переходит к следующему слову, а `break` останавливает цикл после первой находки."),
            O("Напечатать строки с чётными номерами.", """
lines = ["a", "b", "c", "d"]
for i in range(len(lines)):
    if i % 2 == 1:
        continue
    print(i, lines[i])
"""),
            F("Допиши условие: буква — гласная.", """
word = "raven"
count = 0
for ch in word:
    if ch ⟦in "aeiou"⟧:
        count += 1
print(count)
""", "`in` проверяет, есть ли символ в строке гласных."),
            W("Напиши функцию `first_long(words, n)`: первое слово длиннее `n` букв или None, если такого нет.", """
def first_long(words, n):
    # твой код
    pass
""", """
def first_long(words, n):
    for w in words:
        if len(w) > n:
            return w
    return None
""", [('first_long(["a", "bbb", "cccc"], 2)', "'bbb'"), ('first_long(["a"], 3)', "None")],
              ["Пройди по словам циклом.", "Как только нашлось подходящее, сразу верни его: `return w`.",
               "После цикла, если ничего не нашлось, `return None`."]),
        ],
        "dicts": [
            P("""
d = {"a": 1}
print("a" in d, "b" in d, len(d))
""", "`in` проверяет ключи словаря."),
            B("Напечатать имена авторов по алфавиту.", """
years = {"Poe": 1809, "Keats": 1795}
for name in sorted(years):
    print(name)
""", 1, "for name in sorted(years.values()):",
              "`sorted(years)` сортирует ключи, а `values()` — значения."),
            O("Найти автора с самым ранним годом рождения.", """
years = {"Poe": 1809, "Keats": 1795, "Blake": 1757}
oldest = min(years, key=years.get)
print(oldest, years[oldest])
"""),
            F("Допиши: увеличить счётчик слова на 1.", """
counts = {"sea": 2}
counts["sea"] ⟦+= 1⟧
print(counts)
""", "`+=` работает и со значениями словаря."),
            W("Напиши функцию `invert(d)`: новый словарь, где ключи и значения поменялись местами.", """
def invert(d):
    # твой код
    pass
""", """
def invert(d):
    return {v: k for k, v in d.items()}
""", [('invert({"a": 1, "b": 2})', "{1: 'a', 2: 'b'}"), ("invert({})", "{}")],
              ["Пары ключ-значение даёт `d.items()`.", "Словарный генератор: `{новый_ключ: новое_значение for k, v in d.items()}`.",
               "`return {v: k for k, v in d.items()}`"]),
        ],
        "functions": [
            P("""
def add_line(lines, line):
    lines.append(line)
    return len(lines)

poem = ["one"]
print(add_line(poem, "two"), poem)
""", "Список передаётся в функцию не копией: `append` внутри меняет тот же список `poem`."),
            B("Описать поэта фразой «Keats was born in 1795».", """
def describe(name, year):
    return f"{name} was born in {year}"

print(describe("Keats", 1795))
""", 3, 'print(describe(1795, "Keats"))',
              "Аргументы подставляются по порядку. Можно передать по именам: `describe(name=\"Keats\", year=1795)`."),
            O("Функция с параметром по умолчанию.", """
def stanzas(lines, size=4):
    return lines // size
print(stanzas(12))
print(stanzas(12, 3))
"""),
            F("Допиши: среднее значение списка.", """
def average(nums):
    return ⟦sum(nums) / len(nums)⟧

print(average([2, 4, 9]))
""", "Среднее — сумма, делённая на количество."),
            W("Напиши функцию `clean_words(text)`: список слов в нижнем регистре, без знаков `.,!?;:` по краям слов.", """
def clean_words(text):
    # твой код
    pass
""", """
def clean_words(text):
    return [w.strip(".,!?;:").lower() for w in text.split()]
""", [('clean_words("Hope, is the thing!")', "['hope', 'is', 'the', 'thing']"), ('clean_words("")', "[]")],
              ["Разбей текст на слова через `split()`.", "`strip(\".,!?;:\")` убирает эти знаки по краям слова.",
               "`return [w.strip(\".,!?;:\").lower() for w in text.split()]`"]),
        ],
        "comprehensions": [
            P("""
words = ["sea", "sky", "sea"]
print(sorted({w for w in words}), {w: len(w) for w in words})
""", "Генератор множества в фигурных скобках убирает повторы, словарный — собирает пары."),
            B("Оставить только непустые строки.", """
lines = ["Hope", "", "is", ""]
kept = [l for l in lines if l]
print(kept)
""", 1, "kept = [l for l in lines if not l]",
              "Пустая строка — ложь, поэтому `if l` оставляет непустые, а `if not l` — пустые."),
            O("Посчитать длины слов, в которых есть буква e.", """
words = ["sea", "sky", "tree"]
lens = [len(w) for w in words if "e" in w]
total = sum(lens)
print(lens, total)
"""),
            F("Допиши выражение: каждое число умножить на 10.", """
nums = [1, 2, 3]
print([⟦n * 10⟧ for n in nums])
""", "Слева в генераторе — что сделать с каждым элементом."),
            W("Напиши функцию `word_lengths(words)`: словарь «слово → длина», одной строкой.", """
def word_lengths(words):
    # твой код
    pass
""", """
def word_lengths(words):
    return {w: len(w) for w in words}
""", [('word_lengths(["sea", "moon"])', "{'sea': 3, 'moon': 4}"), ("word_lengths([])", "{}")],
              ["Словарный генератор пишут в фигурных скобках.", "Слева от двоеточия ключ, справа значение.", "`return {w: len(w) for w in words}`"]),
        ],
        "errors": [
            P("""
try:
    print("start")
    x = 1 / 0
    print("never")
except ZeroDivisionError:
    print("caught")
finally:
    print("done")
""", "После ошибки остаток блока `try` пропускается. `finally` выполняется всегда."),
            B("Поймать ошибку деления и напечатать её текст.", """
try:
    ratio = 10 / 0
except ZeroDivisionError as e:
    print("error:", e)
""", 2, "except ZeroDivisionError e:",
              "Чтобы получить саму ошибку в переменную, нужно слово `as`: `except ZeroDivisionError as e:`."),
            O("Функция проверяет число строк и сообщает об ошибке.", """
def parse_lines(text):
    n = int(text)
    if n < 0:
        raise ValueError("negative")
    return n
print(parse_lines("14"))
"""),
            F("Допиши, чтобы получить текст ошибки в переменную.", """
try:
    value = int("x")
except ValueError ⟦as e⟧:
    print("bad:", e)
""", "`as e` кладёт пойманную ошибку в переменную `e`."),
            W("Напиши функцию `safe_ratio(a, b)`: `a / b`, округлённое до двух знаков, или 0, если `b` равно нулю.", """
def safe_ratio(a, b):
    # твой код
    pass
""", """
def safe_ratio(a, b):
    try:
        return round(a / b, 2)
    except ZeroDivisionError:
        return 0
""", [("safe_ratio(1, 4)", "0.25"), ("safe_ratio(1, 0)", "0"), ("safe_ratio(2, 3)", "0.67")],
              ["Деление на ноль даёт ZeroDivisionError.", "Оберни деление в `try`, в `except ZeroDivisionError:` верни 0.",
               "В `try`: `return round(a / b, 2)`."]),
        ],
        "classes": [
            P("""
class Poem:
    def __init__(self, title):
        self.title = title

    def __str__(self):
        return f"«{self.title}»"

print(Poem("Hope"))
""", "`__str__` определяет, как объект выглядит в `print`."),
            B("Создать два стихотворения с разными названиями.", """
class Poem:
    def __init__(self, title):
        self.title = title

a = Poem("Hope")
b = Poem("Raven")
print(a.title, b.title)
""", 2, "        title = title",
              "Без `self.` значение остаётся локальной переменной и пропадает после `__init__`."),
            O("Записать строку, дописать вторую и прочитать файл.", """
with open("log.txt", "w", encoding="utf-8") as f:
    f.write("one\\n")
with open("log.txt", "a", encoding="utf-8") as f:
    f.write("two\\n")
with open("log.txt", encoding="utf-8") as f:
    print(f.read().split())
"""),
            F("Допиши метод: вернуть первую строку стихотворения.", """
class Poem:
    def __init__(self, lines):
        self.lines = lines

    def first(self):
        return ⟦self.lines[0]⟧

print(Poem(["Tyger Tyger", "burning bright"]).first())
""", "Строки лежат в `self.lines`, первая — `[0]`."),
            W("Допиши класс `Library`: `add(title)` добавляет название в `self.titles`, `count()` возвращает число названий. "
              "Проверка добавит два названия и вызовет `count()`.", """
class Library:
    def __init__(self):
        self.titles = []

    def add(self, title):
        # твой код
        pass

    def count(self):
        # твой код
        pass
""", """
class Library:
    def __init__(self):
        self.titles = []

    def add(self, title):
        self.titles.append(title)

    def count(self):
        return len(self.titles)
""", [("add_two_and_count()", "2"), ("Library().count()", "0")],
              ["Названия хранятся в списке `self.titles`.", "В `add`: `self.titles.append(title)`.", "В `count`: `return len(self.titles)`."],
              setup="""
def add_two_and_count():
    lib = Library()
    lib.add("Hope")
    lib.add("Raven")
    return lib.count()
"""),
        ],
    }
