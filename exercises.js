// Сгенерировано tools/build_exercises.py — не править вручную.
// Все выводы получены запуском кода; valid — все порядки строк, которые дают нужный вывод.
window.EXERCISES = {
 "p1.t1": {
  "bug": {
   "task": "Программа должна посчитать слова в строке, где между словами случайно два пробела.",
   "lines": [
    "text = \"The sea  is deep\"",
    "words = text.lower().split(\" \")",
    "print(len(words))"
   ],
   "bugLine": 1,
   "fixedLine": "words = text.lower().split()",
   "expected": "4",
   "actual": "5",
   "why": "split(\" \") режет строго по одному пробелу, и между двумя пробелами появляется пустая строка. split() без аргументов режет по любому количеству пробелов."
  },
  "order": {
   "task": "Собери программу, которая находит самое частое слово.",
   "lines": [
    "from collections import Counter",
    "text = \"the sea and the sky\"",
    "words = text.split()",
    "counts = Counter(words)",
    "print(counts.most_common(1))"
   ],
   "expected": "[('the', 2)]",
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
    ],
    [
     1,
     2,
     0,
     3,
     4
    ]
   ]
  }
 },
 "p1.t4": {
  "bug": {
   "task": "Программа должна посчитать число строк в каждом стихотворении.",
   "lines": [
    "import pandas as pd",
    "df = pd.DataFrame({\"text\": [\"a\\nb\", \"c\\nd\\ne\"]})",
    "df[\"n_lines\"] = df[\"text\"].str.count(\"\\n\")",
    "print(df[\"n_lines\"].tolist())"
   ],
   "bugLine": 2,
   "fixedLine": "df[\"n_lines\"] = df[\"text\"].str.count(\"\\n\") + 1",
   "expected": "[2, 3]",
   "actual": "[1, 2]",
   "why": "Переносов строки всегда на один меньше, чем строк. Без «+ 1» каждое стихотворение получается на строку короче."
  },
  "order": {
   "task": "Собери программу, которая считает среднее по каждому автору.",
   "lines": [
    "import pandas as pd",
    "df = pd.DataFrame({\"author\": [\"A\", \"A\", \"B\"], \"n\": [2, 4, 5]})",
    "means = df.groupby(\"author\")[\"n\"].mean()",
    "print(means[\"A\"], means[\"B\"])"
   ],
   "expected": "3.0 5.0",
   "valid": [
    [
     0,
     1,
     2,
     3
    ]
   ]
  }
 },
 "p1.t5": {
  "bug": {
   "task": "Функция должна считать разные слова среди первых n слов текста.",
   "lines": [
    "def vocabulary(words, n=3):",
    "    return len(set(words[n:]))",
    "",
    "print(vocabulary([\"a\", \"b\", \"a\", \"c\", \"d\", \"e\"]))"
   ],
   "bugLine": 1,
   "fixedLine": "    return len(set(words[:n]))",
   "expected": "2",
   "actual": "3",
   "why": "words[:n] — первые n элементов, а words[n:] — всё начиная с номера n. Двоеточие стоит не с той стороны."
  }
 },
 "p2.t3": {
  "bug": {
   "task": "Векторизатор должен построить словарь по обучающим текстам и записать тестовые тексты в том же словаре.",
   "lines": [
    "from sklearn.feature_extraction.text import TfidfVectorizer",
    "train = [\"cold sea\", \"red rose\"]",
    "test = [\"green sea\"]",
    "vec = TfidfVectorizer()",
    "X_train = vec.fit_transform(train)",
    "X_test = vec.fit_transform(test)",
    "print(X_train.shape[1] == X_test.shape[1])"
   ],
   "bugLine": 5,
   "fixedLine": "X_test = vec.transform(test)",
   "expected": "True",
   "actual": "False",
   "why": "fit_transform на тесте строит новый словарь по тестовым текстам. Это утечка, и размеры матриц перестают совпадать. На тесте нужен только transform."
  },
  "order": {
   "task": "Собери программу, которая считает качество базовой модели.",
   "lines": [
    "from sklearn.dummy import DummyClassifier",
    "X = [[0], [1], [2], [3]]",
    "y = [\"A\", \"A\", \"A\", \"B\"]",
    "model = DummyClassifier(strategy=\"most_frequent\")",
    "model.fit(X, y)",
    "print(model.score(X, y))"
   ],
   "expected": "0.75",
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
     3,
     2,
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
     0,
     2,
     3,
     1,
     4,
     5
    ],
    [
     0,
     3,
     1,
     2,
     4,
     5
    ],
    [
     0,
     3,
     2,
     1,
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
    ],
    [
     1,
     0,
     3,
     2,
     4,
     5
    ],
    [
     1,
     2,
     0,
     3,
     4,
     5
    ],
    [
     2,
     0,
     1,
     3,
     4,
     5
    ],
    [
     2,
     0,
     3,
     1,
     4,
     5
    ],
    [
     2,
     1,
     0,
     3,
     4,
     5
    ]
   ]
  }
 },
 "p2.t4": {
  "bug": {
   "task": "Функция должна превращать число в вероятность сигмоидой.",
   "lines": [
    "import numpy as np",
    "",
    "def sigmoid(z):",
    "    return 1 / (1 + np.exp(z))",
    "",
    "print(round(sigmoid(2.0), 3))"
   ],
   "bugLine": 3,
   "fixedLine": "    return 1 / (1 + np.exp(-z))",
   "expected": "0.881",
   "actual": "0.119",
   "why": "В сигмоиде стоит e в степени минус z. Без минуса кривая переворачивается: большие числа превращаются в вероятность около нуля."
  },
  "order": {
   "task": "Собери программу, которая считает взвешенную сумму со смещением.",
   "lines": [
    "import numpy as np",
    "w = np.array([2.0, -1.0])",
    "x = np.array([1, 3])",
    "z = np.dot(w, x) + 0.5",
    "print(z)"
   ],
   "expected": "-0.5",
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
  }
 },
 "p2.t5": {
  "bug": {
   "task": "Градиентный спуск должен найти минимум функции (w − 3)².",
   "lines": [
    "def slope(w):",
    "    return 2 * (w - 3)",
    "",
    "w = 0.0",
    "for step in range(50):",
    "    w = w + 0.1 * slope(w)",
    "print(round(w, 2))"
   ],
   "bugLine": 5,
   "fixedLine": "    w = w - 0.1 * slope(w)",
   "expected": "3.0",
   "actual": "-27298.31",
   "why": "Шаг делают против наклона: из веса вычитают. С плюсом вес идёт вверх по склону и улетает всё дальше от минимума."
  },
  "order": {
   "task": "Собери программу, которая делает три шага градиентного спуска.",
   "lines": [
    "def slope(w):",
    "    return 2 * (w - 3)",
    "w = 0.0",
    "for step in range(3):",
    "    w = w - 0.1 * slope(w)",
    "print(round(w, 3))"
   ],
   "expected": "1.464",
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
     2,
     0,
     1,
     3,
     4,
     5
    ]
   ]
  }
 },
 "p2.t6": {
  "bug": {
   "task": "Программа должна посчитать precision и recall.",
   "lines": [
    "TP, FP, FN = 8, 2, 8",
    "precision = TP / (TP + FN)",
    "recall = TP / (TP + FN)",
    "print(precision, recall)"
   ],
   "bugLine": 1,
   "fixedLine": "precision = TP / (TP + FP)",
   "expected": "0.8 0.5",
   "actual": "0.5 0.5",
   "why": "Precision — доля верных среди всех, кого модель назвала: TP / (TP + FP). В знаменателе по ошибке стоят пропуски FN, как у recall."
  },
  "order": {
   "task": "Собери программу, которая считает долю правильных ответов.",
   "lines": [
    "y_true = [\"D\", \"D\", \"W\", \"W\"]",
    "y_pred = [\"D\", \"W\", \"W\", \"W\"]",
    "correct = sum(t == p for t, p in zip(y_true, y_pred))",
    "print(correct / len(y_true))"
   ],
   "expected": "0.75",
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
  }
 },
 "p3.t1": {
  "bug": {
   "task": "Функция должна возвращать число слов в тексте.",
   "lines": [
    "def count_words(text):",
    "    len(text.split())",
    "",
    "print(count_words(\"cold sea\"))"
   ],
   "bugLine": 1,
   "fixedLine": "    return len(text.split())",
   "expected": "2",
   "actual": "None",
   "why": "Функция считает число, но не возвращает его: нет return. Функция без return возвращает None."
  },
  "order": {
   "task": "Собери программу с функцией, у которой есть значение по умолчанию.",
   "lines": [
    "def greet(name, punctuation=\"!\"):",
    "    return \"Hello, \" + name + punctuation",
    "print(greet(\"Keats\"))"
   ],
   "expected": "Hello, Keats!",
   "valid": [
    [
     0,
     1,
     2
    ]
   ]
  }
 },
 "p4.t3": {
  "bug": {
   "task": "Функция df должна возвращать производную f(x) = (3x + 1)² по правилу цепочки.",
   "lines": [
    "def f(x):",
    "    return (3 * x + 1) ** 2",
    "",
    "def df(x):",
    "    return 2 * (3 * x + 1)",
    "",
    "print(df(2))"
   ],
   "bugLine": 4,
   "fixedLine": "    return 2 * (3 * x + 1) * 3",
   "expected": "42",
   "actual": "14",
   "why": "По правилу цепочки производную внешней функции нужно умножить на производную внутренней. Производная 3x + 1 равна 3, и этот множитель забыт."
  },
  "order": {
   "task": "Собери программу, которая проверяет производную численно.",
   "lines": [
    "def f(x):",
    "    return x ** 2",
    "h = 1e-5",
    "x = 3.0",
    "print(round((f(x + h) - f(x - h)) / (2 * h), 3))"
   ],
   "expected": "6.0",
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
     1,
     3,
     2,
     4
    ],
    [
     2,
     0,
     1,
     3,
     4
    ],
    [
     2,
     3,
     0,
     1,
     4
    ],
    [
     3,
     0,
     1,
     2,
     4
    ],
    [
     3,
     2,
     0,
     1,
     4
    ]
   ]
  }
 },
 "p5.t2": {
  "bug": {
   "task": "Программа должна разрезать пять строк на куски по две строки.",
   "lines": [
    "text = \"a\\nb\\nc\\nd\\ne\"",
    "lines = text.split(\"\\n\")",
    "chunks = [lines[i:i + 2] for i in range(0, len(lines), 1)]",
    "print(len(chunks))"
   ],
   "bugLine": 2,
   "fixedLine": "chunks = [lines[i:i + 2] for i in range(0, len(lines), 2)]",
   "expected": "3",
   "actual": "5",
   "why": "Третий аргумент range — шаг. С шагом 1 куски начинаются с каждой строки и перекрываются. Шаг должен совпадать с размером куска."
  },
  "order": {
   "task": "Собери программу, которая находит номера двух лучших результатов поиска.",
   "lines": [
    "import numpy as np",
    "scores = np.array([0.2, 0.9, 0.5])",
    "best = np.argsort(-scores)[:2]",
    "print(best.tolist())"
   ],
   "expected": "[1, 2]",
   "valid": [
    [
     0,
     1,
     2,
     3
    ]
   ]
  }
 }
};
