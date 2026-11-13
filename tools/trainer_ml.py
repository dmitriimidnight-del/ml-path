"""scikit-learn topics of the trainer. Imported by build_trainer.py; every task is verified the same way.

The browser runs Pyodide 0.28.0 with scikit-learn 1.7.0; the generator may run a newer version. Tasks print
only what does not depend on the version: rounded metrics, plain lists (.tolist()), shapes and feature names,
never the text of a model object. Models are simple and deterministic (k nearest neighbours, a tree with
random_state, naive Bayes, linear regression), and the data is clearly separable.
"""
import re

SPLIT = "from sklearn.model_selection import train_test_split"


def add_ml(topic, P, B, O, F, W0):
    def W(task, starter, solution, tests, hints, setup=""):
        def gap(code):
            return re.sub(r"^((?:(?:from|import) [^\n]+\n)+)(?=def )", r"\1\n\n", code.strip("\n"))
        return W0(task, gap(starter), gap(solution), tests, hints, setup)

    topic("sk_split", "Данные: X, y и разбиение", [],
          "В scikit-learn данные — это `X` и `y`. `X` — таблица признаков: строка — один пример, столбец — один признак, "
          "поэтому даже один признак пишут как `[[14], [8]]`. `y` — ответы, по одному на пример. Модель учится на обучающей части "
          "и проверяется на тестовой, которую не видела: `train_test_split(X, y, test_size=0.25, random_state=0)`. "
          "`random_state` делает разбиение одинаковым при каждом запуске, `stratify=y` сохраняет доли классов.", [
        P(SPLIT + """
X = [[1], [2], [3], [4], [5], [6], [7], [8]]
y = [0, 0, 0, 0, 1, 1, 1, 1]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
print(len(X_tr), len(X_te))
""", "`test_size=0.25` — четверть данных в тест: 2 из 8."),
        P("""
import numpy as np
X = np.array([[14, 3], [8, 2], [20, 5]])
y = np.array([1, 0, 1])
print(X.shape, y.shape, X[:, 1].tolist())
""", "`X` — 3 примера по 2 признака, `y` — 3 ответа. `X[:, 1]` — второй признак у всех примеров."),
        B("Разделить данные и проверить, что в обучающей части признаков и ответов поровну.", SPLIT + """
X = [[i] for i in range(10)]
y = [0] * 5 + [1] * 5
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=1)
print(len(X_tr), len(y_tr))
""", 3, "X_tr, y_tr, X_te, y_te = train_test_split(X, y, test_size=0.2, random_state=1)",
          "`train_test_split` возвращает части в порядке: X_train, X_test, y_train, y_test. Перепутанные имена — частая и тихая ошибка."),
        B("Разделить пополам так, чтобы в тест попал один из двух примеров редкого класса.", SPLIT + """
X = [[i] for i in range(8)]
y = [0, 0, 0, 0, 0, 0, 1, 1]
_, _, _, y_te = train_test_split(X, y, test_size=0.5, random_state=0, stratify=y)
print(sum(y_te))
""", 3, "_, _, _, y_te = train_test_split(X, y, test_size=0.5, random_state=0)",
          "Без `stratify=y` доли классов в частях случайны, и редкий класс может целиком уйти в одну часть."),
        O("Разделить 10 примеров: 30% в тест.", SPLIT + """
X = [[i] for i in range(10)]
y = [0, 1] * 5
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
print(len(X_tr), len(X_te))
"""),
        O("Взять признаки и ответы из таблицы pandas.", """
import pandas as pd
df = pd.DataFrame({"lines": [14, 8, 20], "rhyme": [1, 0, 1], "label": [1, 0, 1]})
X = df[["lines", "rhyme"]]
y = df["label"]
print(X.shape, y.tolist())
"""),
        F("Допиши долю теста: 20%.", SPLIT + """
X = [[i] for i in range(20)]
y = [0, 1] * 10
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=⟦0.2⟧, random_state=0)
print(len(X_te))
""", "Доля теста — число от 0 до 1: `0.2`. Без него берётся 0.25."),
        F("Допиши: признаки — колонки lines и rhyme.", """
import pandas as pd
df = pd.DataFrame({"lines": [14, 8], "rhyme": [1, 0], "label": [1, 0]})
X = df⟦[["lines", "rhyme"]]⟧
print(X.shape)
""", "Несколько колонок — список в квадратных скобках, поэтому скобки двойные."),
        W("Напиши функцию `train_size(X, y)`: сколько примеров попадёт в обучающую часть при `test_size=0.25` и `random_state=0`.", SPLIT + """
def train_size(X, y):
    # твой код
    pass
""", SPLIT + """
def train_size(X, y):
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
    return len(X_tr)
""", [("train_size([[i] for i in range(8)], [0] * 8)", "6"), ("train_size([[i] for i in range(10)], [0] * 10)", "7")],
          ["Раздели данные через `train_test_split` с нужными параметрами.", "Обучающие признаки — первая из четырёх частей.",
           "`X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)`, потом `return len(X_tr)`."]),
        W("Напиши функцию `features_and_target(df, target)`: верни пару — список колонок-признаков (все, кроме `target`) "
          "и список ответов из колонки `target`.", """
import pandas as pd

def features_and_target(df, target):
    # твой код
    pass
""", """
import pandas as pd

def features_and_target(df, target):
    X = df.drop(columns=[target])
    y = df[target]
    return list(X.columns), y.tolist()
""", [('features_and_target(pd.DataFrame({"a": [1], "b": [2], "label": [0]}), "label")', "(['a', 'b'], [0])"),
              ('features_and_target(pd.DataFrame({"label": [1, 0], "n": [5, 6]}), "label")', "(['n'], [1, 0])")],
          ["Признаки — таблица без колонки ответа: `df.drop(columns=[target])`.", "Ответы — колонка `df[target]`.",
           "`return list(X.columns), y.tolist()`"]),
    ], track="ml")

    topic("sk_fit", "fit и predict", [],
          "Любая модель в scikit-learn работает одинаково: создать — `model = KNeighborsClassifier()`, обучить — "
          "`model.fit(X_train, y_train)`, предсказать — `model.predict(X_test)`. `model.score(X, y)` у классификатора — точность. "
          "Начинай с простой базы: `DummyClassifier` всегда отвечает самым частым классом. Модель, которая не лучше базы, ничему не научилась.", [
        P("""
from sklearn.linear_model import LinearRegression
X = [[1], [2], [3]]
y = [2, 4, 6]
model = LinearRegression().fit(X, y)
print(model.predict([[10]]).round(1).tolist())
""", "Модель нашла правило y = 2·x и применила его к 10. `fit` возвращает саму модель, поэтому можно писать в одну строку."),
        P("""
from sklearn.dummy import DummyClassifier
X = [[0], [1], [2], [3]]
y = ["joy", "joy", "joy", "sad"]
base = DummyClassifier(strategy="most_frequent").fit(X, y)
print(base.predict([[5], [6]]).tolist(), base.score(X, y))
""", "База всегда отвечает самым частым классом и уже угадывает 3 из 4. Твоя модель должна быть лучше 0.75."),
        B("Обучить модель ближайшего соседа и предсказать класс для 9.", """
from sklearn.neighbors import KNeighborsClassifier
X = [[1], [2], [10], [11]]
y = [0, 0, 1, 1]
model = KNeighborsClassifier(n_neighbors=1)
model.fit(X, y)
print(model.predict([[9]]).tolist())
""", 4, "model.fit(y, X)",
          "Сначала признаки, потом ответы: `fit(X, y)`. Так во всех моделях scikit-learn."),
        B("Предсказать класс для одного нового примера.", """
from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=1).fit([[1], [10]], [0, 1])
print(model.predict([[8]]).tolist())
""", 2, "print(model.predict([8]).tolist())",
          "`predict` ждёт таблицу примеров, даже если пример один: `[[8]]` — один пример с одним признаком."),
        O("Обучить дерево решений и предсказать два примера.", """
from sklearn.tree import DecisionTreeClassifier
X = [[1], [2], [8], [9]]
y = [0, 0, 1, 1]
model = DecisionTreeClassifier(random_state=0)
model.fit(X, y)
print(model.predict([[3], [7]]).tolist())
"""),
        O("Обучить на одной части и проверить на другой.", """
from sklearn.neighbors import KNeighborsClassifier
X_tr, y_tr = [[1], [2], [8], [9]], [0, 0, 1, 1]
X_te, y_te = [[3], [7]], [0, 0]
model = KNeighborsClassifier(n_neighbors=1).fit(X_tr, y_tr)
print(model.score(X_te, y_te))
"""),
        F("Допиши обучение модели.", """
from sklearn.linear_model import LinearRegression
X = [[0], [1], [2]]
y = [1, 3, 5]
model = LinearRegression()
model.⟦fit(X, y)⟧
print(round(model.coef_[0], 1), round(model.intercept_, 1))
""", "Обучение — `fit(X, y)`. После него у модели появляются найденные коэффициенты: y = 2·x + 1."),
        F("Допиши предсказание для примера 9.", """
from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=1).fit([[1], [10]], ["sad", "joy"])
print(model.⟦predict([[9]])⟧.tolist())
""", "`predict` принимает таблицу примеров: `[[9]]`."),
        W("Напиши функцию `fit_predict(X_train, y_train, X_new)`: обучи `KNeighborsClassifier(n_neighbors=1)` и верни предсказания для `X_new` списком.", """
from sklearn.neighbors import KNeighborsClassifier

def fit_predict(X_train, y_train, X_new):
    # твой код
    pass
""", """
from sklearn.neighbors import KNeighborsClassifier

def fit_predict(X_train, y_train, X_new):
    model = KNeighborsClassifier(n_neighbors=1)
    model.fit(X_train, y_train)
    return model.predict(X_new).tolist()
""", [("fit_predict([[1], [10]], [0, 1], [[2], [9]])", "[0, 1]"), ('fit_predict([[0], [5]], ["a", "b"], [[4]])', "['b']")],
          ["Создай модель с `n_neighbors=1`.", "Обучи: `model.fit(X_train, y_train)`.", "`return model.predict(X_new).tolist()`"]),
        W("Напиши функцию `baseline_accuracy(y)`: точность `DummyClassifier(strategy=\"most_frequent\")` на этих же ответах, "
          "округлённая до двух знаков. Признаки базе не важны, возьми нули: `[[0]] * len(y)`.", """
from sklearn.dummy import DummyClassifier

def baseline_accuracy(y):
    # твой код
    pass
""", """
from sklearn.dummy import DummyClassifier

def baseline_accuracy(y):
    X = [[0]] * len(y)
    base = DummyClassifier(strategy="most_frequent").fit(X, y)
    return round(float(base.score(X, y)), 2)
""", [("baseline_accuracy([1, 1, 0])", "0.67"), ("baseline_accuracy([0, 0, 0, 1])", "0.75")],
          ["Сделай признаки-нули той же длины, что `y`.", "Обучи базу и посчитай `score(X, y)`.",
           "`return round(float(base.score(X, y)), 2)`"]),
    ], track="ml")

    topic("sk_metrics", "Метрики", [],
          "Точность (accuracy) обманывает, когда один класс редкий: если 90% стихов весёлые, ответ «всегда весёлый» даёт 0.9. "
          "Поэтому смотрят precision — какая доля предсказанных положительных верна, recall — какую долю настоящих положительных нашли, "
          "и F1 — их среднее. Аргументы всегда в порядке `(y_true, y_pred)`. Для нескольких классов — `average=\"macro\"`. "
          "`confusion_matrix` показывает, какие классы с какими путаются.", [
        P("""
from sklearn.metrics import accuracy_score, precision_score, recall_score
y_true = [1, 1, 0, 0]
y_pred = [1, 0, 0, 0]
print(accuracy_score(y_true, y_pred), precision_score(y_true, y_pred), recall_score(y_true, y_pred))
""", "Верно 3 из 4. Единицу предсказали один раз и не ошиблись — precision 1.0. Настоящих единиц две, нашли одну — recall 0.5."),
        P("""
from sklearn.metrics import confusion_matrix
y_true = [1, 1, 0, 0]
y_pred = [1, 0, 0, 0]
print(confusion_matrix(y_true, y_pred).tolist())
""", "Строки — настоящие классы, столбцы — предсказанные. Оба нуля угаданы, одну единицу приняли за ноль."),
        B("Посчитать precision модели.", """
from sklearn.metrics import precision_score
y_true = [1, 1, 1, 0]
y_pred = [1, 0, 0, 0]
print(precision_score(y_true, y_pred))
""", 3, "print(precision_score(y_pred, y_true))",
          "Ошибки нет, но метрика другая: precision и recall поменялись местами. Порядок всегда `(y_true, y_pred)`."),
        B("Посчитать F1 для трёх классов эмоций.", """
from sklearn.metrics import f1_score
y_true = ["joy", "sad", "anger", "joy"]
y_pred = ["joy", "sad", "joy", "joy"]
print(round(f1_score(y_true, y_pred, average="macro"), 2))
""", 3, "print(round(f1_score(y_true, y_pred), 2))",
          "Для больше чем двух классов нужно указать, как усреднять: `average=\"macro\"` — среднее по классам, каждый класс одинаково важен."),
        O("Показать, что точность обманывает на редком классе.", """
from sklearn.metrics import accuracy_score, f1_score
y_true = [0, 0, 0, 0, 1]
y_pred = [0, 0, 0, 0, 0]
print(accuracy_score(y_true, y_pred))
print(f1_score(y_true, y_pred, zero_division=0))
"""),
        O("Посчитать ошибки по матрице путаницы.", """
from sklearn.metrics import confusion_matrix
cm = confusion_matrix([1, 0, 1, 1], [1, 1, 0, 1])
errors = cm[0, 1] + cm[1, 0]
print(cm.tolist(), errors)
"""),
        F("Допиши, как усреднять recall по классам.", """
from sklearn.metrics import recall_score
y_true = ["joy", "sad", "sad"]
y_pred = ["joy", "joy", "sad"]
print(round(recall_score(y_true, y_pred, average=⟦"macro"⟧), 2))
""", "Среднее по классам — `\"macro\"`: recall у joy 1.0, у sad 0.5."),
        F("Допиши: точность предсказаний.", """
from sklearn.metrics import accuracy_score
y_true = [1, 0, 1]
y_pred = [1, 1, 1]
print(round(⟦accuracy_score(y_true, y_pred)⟧, 2))
""", "Точность — `accuracy_score(y_true, y_pred)`: верно 2 из 3."),
        W("Напиши функцию `recall_positive(y_true, y_pred)`: recall для класса 1, округлённый до двух знаков. Используй `recall_score`.", """
from sklearn.metrics import recall_score

def recall_positive(y_true, y_pred):
    # твой код
    pass
""", """
from sklearn.metrics import recall_score

def recall_positive(y_true, y_pred):
    return round(float(recall_score(y_true, y_pred)), 2)
""", [("recall_positive([1, 1, 0, 1], [1, 0, 0, 1])", "0.67"), ("recall_positive([1], [1])", "1.0")],
          ["`recall_score(y_true, y_pred)` по умолчанию считает для класса 1.", "Округли: `round(float(...), 2)`.",
           "`return round(float(recall_score(y_true, y_pred)), 2)`"]),
        W("Напиши функцию `macro_f1(y_true, y_pred)`: F1, усреднённый по классам, округлённый до двух знаков.", """
from sklearn.metrics import f1_score

def macro_f1(y_true, y_pred):
    # твой код
    pass
""", """
from sklearn.metrics import f1_score

def macro_f1(y_true, y_pred):
    return round(float(f1_score(y_true, y_pred, average="macro")), 2)
""", [('macro_f1(["joy", "sad"], ["joy", "sad"])', "1.0"), ('macro_f1(["joy", "sad", "sad"], ["joy", "joy", "sad"])', "0.67")],
          ["Нужна `f1_score` с усреднением по классам.", "Параметр — `average=\"macro\"`.",
           "`return round(float(f1_score(y_true, y_pred, average=\"macro\")), 2)`"]),
    ], track="ml")

    topic("sk_text", "Текст в числа", [],
          "Модель понимает только числа. `CountVectorizer` превращает тексты в таблицу: столбец — слово, число — сколько раз оно встретилось. "
          "`TfidfVectorizer` устроен так же, но снижает вес слов, которые есть почти везде. Словарь строят на обучающих текстах — "
          "`fit_transform`, а к новым текстам применяют `transform`: тогда у них те же столбцы, а незнакомые слова пропускаются.", [
        P("""
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer()
X = vec.fit_transform(["the sea", "the sky the sea"])
print(vec.get_feature_names_out().tolist())
print(X.toarray().tolist())
""", "Слова отсортированы по алфавиту. Во втором тексте the встречается дважды."),
        P("""
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer().fit(["sea sky"])
print(vec.transform(["sky moon sky"]).toarray().tolist())
""", "Столбцы — только слова из обучения: sea и sky. Слова moon в словаре нет, оно пропускается."),
        B("Построить словарь на обучении и применить к тесту.", """
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer()
X_train = vec.fit_transform(["sea sky", "moon"])
X_test = vec.transform(["sea star"])
print(X_train.shape, X_test.shape)
""", 3, 'X_test = vec.fit_transform(["sea star"])',
          "`fit_transform` на тесте строит новый словарь, и столбцов становится другое число: модель, обученная на старых столбцах, сломается."),
        B("Превратить одно стихотворение в числа.", """
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer()
X = vec.fit_transform(["hope is the thing"])
print(X.shape)
""", 2, 'X = vec.fit_transform("hope is the thing")',
          "Векторизатор ждёт список текстов. Одна строка — это не список: даже один текст оборачивают в квадратные скобки."),
        O("Научить модель отличать весёлые строки от грустных.", """
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
vec = CountVectorizer()
X = vec.fit_transform(["joy light sun", "grief dark night"])
model = MultinomialNB().fit(X, ["joy", "sad"])
print(model.predict(vec.transform(["dark sun night"])).tolist())
"""),
        O("Убрать служебные слова английского языка.", """
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer(stop_words="english")
vec.fit(["the raven and the night"])
print(vec.get_feature_names_out().tolist())
"""),
        F("Допиши: применить готовый словарь к новому тексту.", """
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer()
vec.fit(["sea sky", "sea"])
print(vec.⟦transform⟧(["sea sea"]).toarray().tolist())
""", "Словарь уже построен, поэтому только `transform`."),
        F("Допиши: брать отдельные слова и пары соседних слов.", """
from sklearn.feature_extraction.text import CountVectorizer
vec = CountVectorizer(ngram_range=⟦(1, 2)⟧)
vec.fit(["dark night"])
print(vec.get_feature_names_out().tolist())
""", "`ngram_range=(1, 2)` — кусочки от одного до двух слов подряд."),
        W("Напиши функцию `vocab(texts)`: список слов, которые `CountVectorizer` нашёл в текстах, по алфавиту.", """
from sklearn.feature_extraction.text import CountVectorizer

def vocab(texts):
    # твой код
    pass
""", """
from sklearn.feature_extraction.text import CountVectorizer

def vocab(texts):
    vec = CountVectorizer().fit(texts)
    return vec.get_feature_names_out().tolist()
""", [('vocab(["Sea sky", "sea"])', "['sea', 'sky']"), ('vocab(["the raven"])', "['raven', 'the']")],
          ["Обучи векторизатор на текстах: `CountVectorizer().fit(texts)`.", "Слова даёт `get_feature_names_out()`.",
           "`return vec.get_feature_names_out().tolist()`"]),
        W("Напиши функцию `word_counts(texts, text)`: обучи `CountVectorizer` на `texts` и верни словарь «слово из словаря → "
          "сколько раз оно есть в `text`», включая нули.", """
from sklearn.feature_extraction.text import CountVectorizer

def word_counts(texts, text):
    # твой код
    pass
""", """
from sklearn.feature_extraction.text import CountVectorizer

def word_counts(texts, text):
    vec = CountVectorizer().fit(texts)
    row = vec.transform([text]).toarray()[0]
    return {str(w): int(c) for w, c in zip(vec.get_feature_names_out(), row)}
""", [('word_counts(["sea sky"], "sky sky moon")', "{'sea': 0, 'sky': 2}"), ('word_counts(["sea", "moon"], "moon moon")', "{'moon': 2, 'sea': 0}")],
          ["Обучи векторизатор на `texts`, потом `transform([text])` — список из одного текста.",
           "`.toarray()[0]` — строка чисел для этого текста; слова — `get_feature_names_out()`.",
           "`return {str(w): int(c) for w, c in zip(vec.get_feature_names_out(), row)}`"]),
    ], track="ml")

    topic("sk_pipe", "Pipeline и честная проверка", [],
          "Главное правило: всё, что модель узнаёт о данных — среднее, словарь, веса, — узнаётся только на обучающей части. "
          "Если подсмотреть тест, оценка выйдет красивой, а на новых данных модель провалится: это утечка данных. "
          "`StandardScaler` выравнивает признаки: среднее 0, разброс 1. `Pipeline` склеивает шаги и сам делает `fit` на обучении "
          "и `transform` на тесте. `cross_val_score` проверяет модель на нескольких разбиениях подряд.", [
        P("""
from sklearn.preprocessing import StandardScaler
sc = StandardScaler().fit([[0], [10]])
print(sc.mean_.tolist(), sc.transform([[5], [10]]).tolist())
""", "Среднее обучающих данных 5, разброс 5. Значит 5 превращается в 0, а 10 — в 1."),
        P("""
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))
pipe.fit([[1], [2], [9], [10]], [0, 0, 1, 1])
print(list(pipe.named_steps), pipe.predict([[8]]).tolist())
""", "`make_pipeline` сам называет шаги по названиям классов. `fit` и `predict` у пайплайна — как у обычной модели."),
        B("Масштабировать тест по параметрам обучающих данных.", """
from sklearn.preprocessing import StandardScaler
X_train = [[0], [10]]
X_test = [[100]]
sc = StandardScaler().fit(X_train)
print(sc.transform(X_test).tolist())
""", 3, "sc = StandardScaler().fit(X_train + X_test)",
          "Это утечка данных: масштаб узнали в том числе по тесту. Параметры берут только из обучающей части."),
        B("Собрать пайплайн из масштабирования и логистической регрессии.", """
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression())])
pipe.fit([[1], [2], [9], [10]], [0, 0, 1, 1])
print(pipe.predict([[0], [11]]).tolist())
""", 3, "pipe = Pipeline([StandardScaler(), LogisticRegression()])",
          "`Pipeline` ждёт пары «имя, шаг». Без имён удобнее `make_pipeline(StandardScaler(), LogisticRegression())`."),
        O("Проверить модель на трёх разбиениях.", """
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
X = [[1], [2], [3], [8], [9], [10]]
y = [0, 0, 0, 1, 1, 1]
scores = cross_val_score(KNeighborsClassifier(n_neighbors=1), X, y, cv=3)
print(scores.tolist(), scores.mean())
"""),
        O("Собрать пайплайн для текстов.", """
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
pipe = make_pipeline(CountVectorizer(), MultinomialNB())
pipe.fit(["joy sun", "grief night"], ["joy", "sad"])
print(pipe.predict(["night night"]).tolist())
"""),
        F("Допиши: масштабировать тест параметрами, найденными на обучении.", """
from sklearn.preprocessing import StandardScaler
sc = StandardScaler()
X_train = sc.fit_transform([[0], [10]])
X_test = sc.⟦transform⟧([[20]])
print(X_test.tolist())
""", "Для теста — только `transform`. `fit_transform` заново посчитал бы среднее по тесту."),
        F("Допиши число разбиений: три.", """
from sklearn.model_selection import cross_val_score
from sklearn.dummy import DummyClassifier
X = [[0]] * 6
y = [0, 0, 0, 1, 1, 1]
print(len(cross_val_score(DummyClassifier(), X, y, cv=⟦3⟧)))
""", "Параметр `cv` — сколько раз делить данные. По умолчанию 5."),
        W("Напиши функцию `make_model()`: верни пайплайн из `StandardScaler` и `KNeighborsClassifier(n_neighbors=1)`.", """
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

def make_model():
    # твой код
    pass
""", """
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

def make_model():
    return make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))
""", [("make_model().fit([[1], [2], [9], [10]], [0, 0, 1, 1]).predict([[3], [8]]).tolist()", "[0, 1]"), ("len(make_model().steps)", "2")],
          ["`make_pipeline` принимает шаги по порядку.", "Сначала масштабирование, потом модель.",
           "`return make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=1))`"]),
        W("Напиши функцию `cv_mean(X, y)`: средняя точность `KNeighborsClassifier(n_neighbors=1)` по `cross_val_score` с `cv=3`, "
          "округлённая до двух знаков.", """
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier

def cv_mean(X, y):
    # твой код
    pass
""", """
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier

def cv_mean(X, y):
    scores = cross_val_score(KNeighborsClassifier(n_neighbors=1), X, y, cv=3)
    return round(float(scores.mean()), 2)
""", [("cv_mean([[1], [2], [3], [8], [9], [10]], [0, 0, 0, 1, 1, 1])", "1.0"),
              ("cv_mean([[1], [2], [3], [4], [5], [6]], [0, 1, 0, 1, 0, 1])", "0.33")],
          ["`cross_val_score(модель, X, y, cv=3)` вернёт три оценки.", "Среднее — `.mean()`, потом округление.",
           "`return round(float(scores.mean()), 2)`"]),
    ], track="ml")
