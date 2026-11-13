"""NumPy and pandas topics of the trainer. Imported by build_trainer.py; every task is verified the same way.

The browser runs Pyodide 0.28.0 (numpy 2.2.5, pandas 2.3.0), the learner's computer will likely have newer
versions. Tasks avoid output that differs between versions: no dtype lines, no numpy scalar reprs in lists
(.tolist() and .to_dict() give plain Python values), no positional [] on a Series with a text index,
no chained assignment. build_trainer.py checks the outputs for these markers.
"""
import re

NP = "import numpy as np"
PD = "import pandas as pd"


def add_data(topic, P, B, O, F, W0):
    def W(task, starter, solution, tests, hints, setup=""):
        def gap(code):
            return re.sub(r"^(import \w+ as \w+)\n(?=def )", r"\1\n\n\n", code.strip("\n"))
        return W0(task, gap(starter), gap(solution), tests, hints, setup)

    topic("np_arrays", "NumPy: массивы", [],
          "Массив NumPy — набор чисел, с которым действия идут сразу над всеми элементами: `a * 2` умножает каждый. "
          "Создают из списка: `np.array([1, 2, 3])`. `a.shape` — размеры, `np.arange(n)` — числа от 0 до n−1, "
          "`a.tolist()` — обратно в обычный список. На массивах держатся pandas, scikit-learn и PyTorch.", [
        P(NP + """
a = np.array([1, 2, 3])
print(a * 2, a + a)
""", "Действие применяется к каждому элементу. Со списком `[1, 2, 3] * 2` получился бы список, повторённый дважды."),
        P(NP + """
m = np.array([[1, 2, 3], [4, 5, 6]])
print(m.shape, len(m), m.size)
""", "`shape` — (строк, столбцов), `len` — число строк, `size` — сколько всего чисел."),
        B("Удвоить длину каждого стихотворения.", NP + """
lengths = np.array([14, 8, 20])
print(lengths * 2)
""", 1, "lengths = [14, 8, 20]",
          "Обычный список при умножении на 2 повторяется. Чтобы умножить каждое число, нужен массив `np.array`."),
        B("Получить числа от 0 до 4.", NP + """
a = np.arange(5)
print(a.tolist())
""", 1, "a = np.arange(1, 5)",
          "`np.arange` работает как `range`: по умолчанию начинает с 0 и не включает конец."),
        O("Перевести доли в проценты с одним знаком.", NP + """
scores = np.array([0.912, 0.784])
pct = np.round(scores * 100, 1)
print(pct.tolist())
"""),
        O("Завести счётчики-нули и записать первый.", NP + """
counts = np.zeros(3, dtype=int)
counts[0] = 5
print(counts.tolist(), counts.shape)
"""),
        F("Допиши: создай массив из списка.", NP + """
a = ⟦np.array⟧([3, 1, 2])
print(a * 10)
""", "Массив из списка создаёт `np.array(список)`."),
        F("Допиши: размеры таблицы.", NP + """
m = np.array([[1, 2], [3, 4], [5, 6]])
print(m⟦.shape⟧)
""", "`shape` — кортеж (строк, столбцов)."),
        W("Напиши функцию `normalize(values)`: каждое число делится на максимум, результат — обычный список.", NP + """
def normalize(values):
    # твой код
    pass
""", NP + """
def normalize(values):
    a = np.array(values)
    return (a / a.max()).tolist()
""", [("normalize([1, 2, 4])", "[0.25, 0.5, 1.0]"), ("normalize([5])", "[1.0]")],
          ["Сделай массив: `a = np.array(values)`.", "Деление массива на число делит каждый элемент: `a / a.max()`.",
           "`return (a / a.max()).tolist()`"]),
        W("Напиши функцию `to_percent(shares)`: доли в проценты с одним знаком после точки, обычным списком.", NP + """
def to_percent(shares):
    # твой код
    pass
""", NP + """
def to_percent(shares):
    return np.round(np.array(shares) * 100, 1).tolist()
""", [("to_percent([0.5, 0.123])", "[50.0, 12.3]"), ("to_percent([])", "[]")],
          ["Сделай массив и умножь на 100.", "Округлить все элементы: `np.round(массив, 1)`.",
           "`return np.round(np.array(shares) * 100, 1).tolist()`"]),
    ], track="data")

    topic("np_index", "NumPy: индексы и маски", [],
          "Индексы и срезы — как у списков: `a[0]`, `a[-2:]`. Маска — массив из True и False: `a > 10`. "
          "`a[a > 10]` оставляет только подходящие элементы. Два условия соединяют `&` и берут каждое в скобки. "
          "В таблице `m[строка, столбец]`, а `m[:, 0]` — весь первый столбец.", [
        P(NP + """
a = np.array([5, 12, 8, 20])
print(a[a > 10], (a > 10).sum())
""", "Маска оставляет элементы, где True. При сложении True считается как 1, поэтому сумма маски — число подходящих."),
        P(NP + """
m = np.array([[1, 2, 3], [4, 5, 6]])
print(m[1, 2], m[:, 0], m[0])
""", "`m[1, 2]` — строка 1, столбец 2. `m[:, 0]` — все строки, столбец 0. `m[0]` — вся первая строка."),
        B("Оставить длины больше 10 и меньше 30.", NP + """
lens = np.array([5, 14, 40, 22])
mid = lens[(lens > 10) & (lens < 30)]
print(mid)
""", 2, "mid = lens[lens > 10 and lens < 30]",
          "`and` не умеет сравнивать массивы целиком. Для масок нужен `&`, а каждое условие — в скобках."),
        B("Взять второй столбец таблицы.", NP + """
m = np.array([[1, 10], [2, 20], [3, 30]])
print(m[:, 1])
""", 2, "print(m[1])",
          "`m[1]` — вторая строка. Столбец — `m[:, 1]`: двоеточие значит «все строки»."),
        O("Заменить отрицательные числа нулями.", NP + """
a = np.array([3, -1, 4, -5])
a[a < 0] = 0
print(a)
"""),
        O("Взять два последних элемента и сложить.", NP + """
a = np.array([4, 8, 15, 16])
tail = a[-2:]
print(tail, tail.sum())
"""),
        F("Допиши маску: оценки не ниже 0.7.", NP + """
scores = np.array([0.9, 0.4, 0.75])
good = scores[⟦scores >= 0.7⟧]
print(len(good))
""", "Маска — сравнение массива с числом: `scores >= 0.7`."),
        F("Допиши индекс: строка 1, столбец 0.", NP + """
m = np.array([[1, 2], [3, 4]])
print(m[⟦1, 0⟧])
""", "Сначала номер строки, потом столбца, через запятую."),
        W("Напиши функцию `count_above(values, limit)`: сколько чисел больше `limit`.", NP + """
def count_above(values, limit):
    # твой код
    pass
""", NP + """
def count_above(values, limit):
    return int((np.array(values) > limit).sum())
""", [("count_above([1, 5, 10], 4)", "2"), ("count_above([], 1)", "0"), ("count_above([3, 3], 3)", "0")],
          ["Сделай массив и маску: `np.array(values) > limit`.", "Сумма маски — число True.",
           "`return int((np.array(values) > limit).sum())`"]),
        W("Напиши функцию `column(rows, j)`: столбец `j` из списка строк таблицы, обычным списком.", NP + """
def column(rows, j):
    # твой код
    pass
""", NP + """
def column(rows, j):
    return np.array(rows)[:, j].tolist()
""", [("column([[1, 2], [3, 4]], 1)", "[2, 4]"), ("column([[7, 8, 9]], 0)", "[7]")],
          ["Преврати список строк в массив.", "Весь столбец — срез `[:, j]`.", "`return np.array(rows)[:, j].tolist()`"]),
    ], track="data")

    topic("np_agg", "NumPy: подсчёты", [],
          "`sum`, `mean`, `max`, `min` считают по всему массиву, `argmax` — номер самого большого элемента. "
          "В таблице `axis=0` считает по столбцам (сверху вниз), `axis=1` — по строкам (слева направо). "
          "Так считают метрики: точность — это среднее маски «предсказание совпало».", [
        P(NP + """
a = np.array([3, 9, 6])
print(a.sum(), a.mean(), a.argmax())
""", "Среднее всегда дробное. `argmax` — номер максимума: 9 стоит на месте 1."),
        P(NP + """
m = np.array([[1, 2], [3, 4]])
print(m.sum(axis=0), m.sum(axis=1))
""", "`axis=0` складывает по столбцам: 1+3 и 2+4. `axis=1` — по строкам: 1+2 и 3+4."),
        B("Средняя оценка каждой модели. Каждая строка — одна модель.", NP + """
scores = np.array([[0.8, 0.6], [0.9, 0.7]])
print(scores.mean(axis=1).round(2).tolist())
""", 2, "print(scores.mean(axis=0).round(2).tolist())",
          "`axis=0` усредняет по столбцам, то есть по разным моделям. Для каждой строки нужен `axis=1`."),
        B("Найти номер лучшей модели.", NP + """
f1 = np.array([0.71, 0.88, 0.80])
print(f1.argmax())
""", 2, "print(f1.max())",
          "`max` даёт само значение, а номер элемента — `argmax`."),
        O("Посчитать долю длинных строк.", NP + """
lens = np.array([5, 14, 40, 22])
long = lens > 10
print(long.mean())
"""),
        O("Посчитать точность предсказаний.", NP + """
y_true = np.array([1, 0, 1, 1])
y_pred = np.array([1, 1, 1, 0])
acc = (y_true == y_pred).mean()
print(acc)
"""),
        F("Допиши: среднее по каждому столбцу.", NP + """
m = np.array([[2, 4], [6, 8]])
print(m.mean(⟦axis=0⟧))
""", "По столбцам — `axis=0`."),
        F("Допиши: номер самого маленького значения.", NP + """
losses = np.array([0.9, 0.3, 0.5])
print(losses⟦.argmin()⟧)
""", "Номер минимума — `argmin()`, по аналогии с `argmax()`."),
        W("Напиши функцию `accuracy(y_true, y_pred)`: доля совпадений, округлённая до двух знаков.", NP + """
def accuracy(y_true, y_pred):
    # твой код
    pass
""", NP + """
def accuracy(y_true, y_pred):
    return round(float((np.array(y_true) == np.array(y_pred)).mean()), 2)
""", [("accuracy([1, 0, 1], [1, 1, 1])", "0.67"), ("accuracy([1, 1], [1, 1])", "1.0")],
          ["Сравни два массива: получится маска совпадений.", "Доля True — среднее маски: `.mean()`.",
           "`return round(float((np.array(y_true) == np.array(y_pred)).mean()), 2)`"]),
        W("Напиши функцию `best_model(names, scores)`: имя модели с самой высокой оценкой.", NP + """
def best_model(names, scores):
    # твой код
    pass
""", NP + """
def best_model(names, scores):
    return names[int(np.argmax(scores))]
""", [('best_model(["a", "b", "c"], [0.5, 0.9, 0.7])', "'b'"), ('best_model(["x"], [0.1])', "'x'")],
          ["Нужен номер максимума: `np.argmax(scores)`.", "По этому номеру возьми имя из `names`.",
           "`return names[int(np.argmax(scores))]`"]),
    ], track="data")

    topic("pd_frame", "pandas: таблица DataFrame", [],
          "DataFrame — таблица: строка — одна запись, колонка — одно поле. Её делают из списка словарей "
          "`pd.DataFrame(poems)` или из словаря колонок. `df.shape` — размеры, `df[\"lines\"]` — одна колонка (Series), "
          "`df[[\"title\", \"lines\"]]` — несколько, `df.iloc[0]` — первая строка. `tolist()` превращает колонку в список.", [
        P(PD + """
df = pd.DataFrame([{"title": "Hope", "lines": 12}, {"title": "Raven", "lines": 108}])
print(df.shape, list(df.columns))
""", "Каждый словарь стал строкой, ключи — колонками."),
        P(PD + """
df = pd.DataFrame({"title": ["Hope", "Raven", "Tyger"], "lines": [12, 108, 24]})
print(df["lines"].sum(), df["title"].tolist()[-1])
""", "Колонку можно сложить целиком, а `tolist()` делает из неё обычный список."),
        B("Найти самое длинное стихотворение по числу строк.", PD + """
df = pd.DataFrame({"title": ["Hope", "Raven"], "lines": [12, 108]})
print(df["lines"].max())
""", 2, 'print(df["Lines"].max())',
          "Название колонки должно совпадать до буквы, включая регистр. Список колонок — `df.columns`."),
        B("Взять две колонки.", PD + """
df = pd.DataFrame({"title": ["Hope"], "author": ["Dickinson"], "lines": [12]})
print(df[["title", "lines"]].shape)
""", 2, 'print(df["title", "lines"].shape)',
          "Несколько колонок передают списком, поэтому скобки двойные: `df[[\"title\", \"lines\"]]`."),
        O("Построить таблицу и напечатать первую запись.", PD + """
poems = [{"title": "Hope", "lines": 12}, {"title": "Raven", "lines": 108}]
df = pd.DataFrame(poems)
first = df.iloc[0]
print(first["title"], first["lines"])
"""),
        O("Посчитать среднюю длину.", PD + """
df = pd.DataFrame({"lines": [12, 108, 24]})
avg = df["lines"].mean()
print(round(avg, 1))
"""),
        F("Допиши: сколько строк в таблице.", PD + """
df = pd.DataFrame({"title": ["Hope", "Raven"], "lines": [12, 108]})
print(⟦len(df)⟧)
""", "Число строк — `len(df)` или `df.shape[0]`."),
        F("Допиши: колонка с названиями.", PD + """
df = pd.DataFrame({"title": ["Hope", "Raven", "Tyger"]})
print(df⟦["title"]⟧.tolist())
""", "Колонку берут по названию в квадратных скобках."),
        W("Напиши функцию `total_lines(poems)`: сумма поля `\"lines\"` по списку словарей. Сделай через DataFrame.", PD + """
def total_lines(poems):
    # твой код
    pass
""", PD + """
def total_lines(poems):
    df = pd.DataFrame(poems)
    return int(df["lines"].sum())
""", [('total_lines([{"title": "a", "lines": 3}, {"title": "b", "lines": 4}])', "7"),
              ('total_lines([{"title": "a", "lines": 10}])', "10")],
          ["Сделай таблицу: `pd.DataFrame(poems)`.", "Сумма колонки — `df[\"lines\"].sum()`.", "`return int(df[\"lines\"].sum())`"]),
        W("Напиши функцию `titles(df)`: список значений колонки `\"title\"`.", PD + """
def titles(df):
    # твой код
    pass
""", PD + """
def titles(df):
    return df["title"].tolist()
""", [('titles(pd.DataFrame({"title": ["A", "B"]}))', "['A', 'B']"), ('titles(pd.DataFrame({"title": []}))', "[]")],
          ["Колонка — `df[\"title\"]`.", "В список превращает `tolist()`.", "`return df[\"title\"].tolist()`"]),
    ], track="data")

    topic("pd_filter", "pandas: фильтры и новые колонки", [],
          "Фильтр — маска, как в NumPy: `df[df[\"lines\"] > 20]`. Два условия — через `&`, каждое в скобках. "
          "Новая колонка появляется присваиванием: `df[\"stanzas\"] = df[\"lines\"] // 4`. "
          "Методы строк вызывают через `.str`: `df[\"title\"].str.len()`. Сортировка — `sort_values`.", [
        P(PD + """
df = pd.DataFrame({"title": ["Hope", "Raven", "Tyger"], "lines": [12, 108, 24]})
long = df[df["lines"] > 20]
print(long["title"].tolist())
""", "Маска оставляет строки таблицы, где условие верно."),
        P(PD + """
df = pd.DataFrame({"title": ["Hope", "Raven"], "lines": [12, 108]})
df["stanzas"] = df["lines"] // 4
print(df["stanzas"].tolist(), df.shape)
""", "Новая колонка считается для каждой строки сразу, колонок стало три."),
        B("Найти стихотворения По длиннее 50 строк.", PD + """
df = pd.DataFrame({"author": ["Poe", "Poe", "Keats"], "lines": [108, 20, 80]})
sel = df[(df["author"] == "Poe") & (df["lines"] > 50)]
print(len(sel))
""", 2, 'sel = df[df["author"] == "Poe" & df["lines"] > 50]',
          "`&` выполняется раньше сравнений, поэтому Python пытается вычислить `\"Poe\" & df[\"lines\"]`. Каждое условие берут в скобки."),
        B("Найти самое длинное стихотворение сортировкой.", PD + """
df = pd.DataFrame({"title": ["Hope", "Raven", "Tyger"], "lines": [12, 108, 24]})
top = df.sort_values("lines", ascending=False)
print(top["title"].tolist()[0])
""", 2, 'top = df.sort_values("lines")',
          "По умолчанию сортировка по возрастанию, и первым оказывается самое короткое. Нужно `ascending=False`."),
        O("Найти самое длинное название.", PD + """
df = pd.DataFrame({"title": ["Hope", "The Raven", "Tyger"]})
df["n"] = df["title"].str.len()
best = df.sort_values("n").iloc[-1]
print(best["title"], best["n"])
"""),
        O("Оставить строки со словом love.", PD + """
df = pd.DataFrame({"line": ["love is", "sea", "my love"]})
mask = df["line"].str.contains("love")
print(df[mask]["line"].tolist())
"""),
        F("Допиши маску: стихотворения короче 50 строк.", PD + """
df = pd.DataFrame({"title": ["Hope", "Raven"], "lines": [12, 108]})
short = df[⟦df["lines"] < 50⟧]
print(short["title"].tolist())
""", "Маска — сравнение колонки с числом."),
        F("Допиши: все названия заглавными буквами.", PD + """
df = pd.DataFrame({"title": ["hope", "raven"]})
df["title"] = df["title"]⟦.str.upper()⟧
print(df["title"].tolist())
""", "Методы строк для колонки вызывают через `.str`."),
        W("Напиши функцию `long_titles(df, n)`: названия стихотворений, у которых больше `n` строк. "
          "В таблице колонки `\"title\"` и `\"lines\"`.", PD + """
def long_titles(df, n):
    # твой код
    pass
""", PD + """
def long_titles(df, n):
    return df[df["lines"] > n]["title"].tolist()
""", [('long_titles(pd.DataFrame({"title": ["A", "B"], "lines": [5, 50]}), 10)', "['B']"),
              ('long_titles(pd.DataFrame({"title": ["A"], "lines": [5]}), 10)', "[]")],
          ["Отфильтруй строки маской `df[\"lines\"] > n`.", "Из результата возьми колонку `\"title\"` и `tolist()`.",
           "`return df[df[\"lines\"] > n][\"title\"].tolist()`"]),
        W("Напиши функцию `add_words(df)`: добавь колонку `\"words\"` — число слов в колонке `\"line\"` — и верни таблицу.", PD + """
def add_words(df):
    # твой код
    return df
""", PD + """
def add_words(df):
    df["words"] = df["line"].str.split().str.len()
    return df
""", [('add_words(pd.DataFrame({"line": ["a b", "c"]}))["words"].tolist()', "[2, 1]"),
              ('add_words(pd.DataFrame({"line": ["one two three"]}))["words"].tolist()', "[3]")],
          ["Разбей каждую строку на слова: `df[\"line\"].str.split()`.", "Длину каждого списка даёт ещё один `.str.len()`.",
           "`df[\"words\"] = df[\"line\"].str.split().str.len()`, потом `return df`."]),
    ], track="data")

    topic("pd_group", "pandas: группировка", [],
          "`value_counts()` считает, сколько раз встречается каждое значение, — так смотрят баланс классов. "
          "`df.groupby(\"author\")[\"lines\"].mean()` считает среднее отдельно для каждого автора. "
          "Результат — Series, где авторы стоят в индексе; `to_dict()` превращает её в словарь.", [
        P(PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"]})
print(df["author"].value_counts().to_dict())
""", "`value_counts` считает повторы и ставит самые частые первыми."),
        P(PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"], "lines": [108, 14, 20]})
print(df.groupby("author")["lines"].sum().to_dict())
""", "Группы отсортированы по названию: сначала Keats. У По 108 + 20 строк."),
        B("Средняя длина стихотворения у каждого автора.", PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"], "lines": [108, 14, 20]})
print(df.groupby("author")["lines"].mean().to_dict())
""", 2, 'print(df.groupby("author")["lines"].count().to_dict())',
          "`count` считает, сколько записей в группе. Среднее — `mean`."),
        B("Найти самого частого автора.", PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"]})
print(df["author"].value_counts().index[0])
""", 2, 'print(df["author"].value_counts().index[-1])',
          "`value_counts` сортирует по убыванию: самый частый — первый, `index[0]`."),
        O("Найти автора с самыми длинными стихами в среднем.", PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"], "lines": [108, 14, 20]})
avg = df.groupby("author")["lines"].mean()
best = avg.idxmax()
print(best, avg[best])
"""),
        O("Посчитать доли классов в разметке.", PD + """
labels = pd.Series(["joy", "sad", "joy", "joy"])
share = labels.value_counts(normalize=True)
print(share.to_dict())
"""),
        F("Допиши, по какой колонке группировать.", PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"], "lines": [108, 14, 20]})
print(df.groupby(⟦"author"⟧)["lines"].max().to_dict())
""", "Группируем по автору: `groupby(\"author\")`."),
        F("Допиши: сколько раз встречается каждый автор.", PD + """
df = pd.DataFrame({"author": ["Poe", "Keats", "Poe"]})
print(df["author"]⟦.value_counts()⟧.to_dict())
""", "Повторы считает `value_counts()`."),
        W("Напиши функцию `poems_per_author(df)`: словарь «автор → число стихотворений».", PD + """
def poems_per_author(df):
    # твой код
    pass
""", PD + """
def poems_per_author(df):
    return df["author"].value_counts().to_dict()
""", [('poems_per_author(pd.DataFrame({"author": ["Poe", "Keats", "Poe"]}))', "{'Poe': 2, 'Keats': 1}"),
              ('poems_per_author(pd.DataFrame({"author": ["Blake"]}))', "{'Blake': 1}")],
          ["Повторы в колонке считает `value_counts()`.", "В словарь превращает `to_dict()`.",
           "`return df[\"author\"].value_counts().to_dict()`"]),
        W("Напиши функцию `mean_lines(df)`: словарь «автор → средняя длина», округлённая до одного знака.", PD + """
def mean_lines(df):
    # твой код
    pass
""", PD + """
def mean_lines(df):
    return df.groupby("author")["lines"].mean().round(1).to_dict()
""", [('mean_lines(pd.DataFrame({"author": ["Poe", "Keats", "Poe"], "lines": [108, 14, 20]}))', "{'Keats': 14.0, 'Poe': 64.0}"),
              ('mean_lines(pd.DataFrame({"author": ["A", "A", "A"], "lines": [1, 2, 2]}))', "{'A': 1.7}")],
          ["Группируй по автору и бери колонку `\"lines\"`.", "Среднее — `mean()`, округление — `round(1)`.",
           "`return df.groupby(\"author\")[\"lines\"].mean().round(1).to_dict()`"]),
    ], track="data")

    topic("pd_clean", "pandas: чистка данных", [],
          "В настоящих данных бывают пропуски (NaN), повторы и лишние пробелы. `isna().sum()` считает пропуски, "
          "`dropna()` убирает строки с ними, `fillna(0)` заполняет. `drop_duplicates()` убирает повторы, "
          "`astype(int)` меняет тип. Эти методы возвращают новую таблицу — результат нужно присвоить.", [
        P(PD + """
s = pd.Series([12, None, 24])
print(s.isna().sum(), s.fillna(0).tolist())
""", "Пропуск один. Из-за пропуска колонка стала дробной, поэтому и после заполнения числа дробные."),
        P(PD + """
df = pd.DataFrame({"title": ["Hope", "Hope", "Raven"]})
print(len(df), len(df.drop_duplicates()))
""", "`drop_duplicates` убирает строки, полностью совпадающие с более ранними."),
        B("Убрать строки с пропусками.", PD + """
df = pd.DataFrame({"title": ["Hope", None, "Raven"]})
df = df.dropna()
print(len(df))
""", 2, "df.dropna()",
          "`dropna` не меняет таблицу, а возвращает новую. Её нужно сохранить: `df = df.dropna()`."),
        B("Привести названия к одному виду и посчитать разные.", PD + """
s = pd.Series([" Hope", "hope ", "HOPE"])
clean = s.str.strip().str.lower()
print(clean.nunique())
""", 2, "clean = s.str.lower()",
          "Без `strip()` пробелы по краям остаются, и « hope» и «hope » считаются разными."),
        O("Заполнить пропуск средним значением.", PD + """
s = pd.Series([10, None, 20])
mean = s.mean()
s = s.fillna(mean)
print(s.tolist())
"""),
        O("Превратить строки в числа и посчитать.", PD + """
s = pd.Series(["12", "108", "24"])
n = s.astype(int)
print(n.sum(), n.max())
"""),
        F("Допиши: заполни пропуски нулями.", PD + """
df = pd.DataFrame({"lines": [12, None, 24]})
df["lines"] = df["lines"]⟦.fillna(0)⟧
print(df["lines"].tolist())
""", "Заполняет пропуски `fillna(значение)`."),
        F("Допиши: убери повторяющиеся строки.", PD + """
df = pd.DataFrame({"title": ["Hope", "Hope", "Raven"], "lines": [12, 12, 108]})
df = df⟦.drop_duplicates()⟧
print(df.shape)
""", "Повторы убирает `drop_duplicates()`."),
        W("Напиши функцию `clean_titles(titles)`: названия без пробелов по краям, строчными буквами, без повторов, "
          "в исходном порядке. Сделай через `pd.Series`.", PD + """
def clean_titles(titles):
    # твой код
    pass
""", PD + """
def clean_titles(titles):
    s = pd.Series(titles).str.strip().str.lower()
    return s.drop_duplicates().tolist()
""", [('clean_titles([" Hope", "hope", "Raven "])', "['hope', 'raven']"), ('clean_titles(["A"])', "['a']")],
          ["Сделай Series из списка и почисти: `.str.strip().str.lower()`.", "Повторы убирает `drop_duplicates()`, порядок сохраняется.",
           "`return pd.Series(titles).str.strip().str.lower().drop_duplicates().tolist()`"]),
        W("Напиши функцию `missing_share(values)`: доля пропусков (None) в списке, округлённая до двух знаков.", PD + """
def missing_share(values):
    # твой код
    pass
""", PD + """
def missing_share(values):
    return round(float(pd.Series(values).isna().mean()), 2)
""", [("missing_share([1, None, 3, None])", "0.5"), ("missing_share([1, 2])", "0.0"), ("missing_share([None, 1, 2])", "0.33")],
          ["`isna()` даёт маску пропусков.", "Доля True — среднее маски: `.mean()`.",
           "`return round(float(pd.Series(values).isna().mean()), 2)`"]),
    ], track="data")
