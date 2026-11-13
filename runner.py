"""Runs lesson code inside the browser (Pyodide) and returns the result as JSON.

The same file is used by tools/check_runner.py, which runs every lesson example
through it in regular Python to make sure outputs match the lessons.
"""
import base64
import contextlib
import io
import json
import os
import sys
import traceback

os.environ.setdefault("MPLBACKEND", "Agg")

# Example file used by the lesson "Python for text".
if not os.path.exists("poem.txt"):
    with open("poem.txt", "w", encoding="utf-8") as _f:
        _f.write("The night is dark,\nand the moon is bright!\n")

_spaces = {}

_HINTS = {
    "NameError": "Python не знает такого имени. Проверь опечатку. Если имя создаётся в другом примере урока, нажми «Начать заново»: примеры выполнятся по порядку.",
    "SyntaxError": "Код записан с ошибкой: проверь скобки, кавычки и двоеточия в конце строк с for, if и def.",
    "IndentationError": "Сбились отступы. Строки внутри for, if и def сдвигаются на 4 пробела.",
    "TypeError": "Действие применено к значению неподходящего типа, например строку сложили с числом.",
    "KeyError": "В словаре нет такого ключа. Проверь написание и регистр букв.",
    "IndexError": "Номер элемента больше, чем элементов в списке. Помни: счёт идёт с нуля.",
    "ValueError": "Неподходящее значение. В уроках про матрицы это чаще всего несовпадение размеров.",
    "ZeroDivisionError": "Деление на ноль.",
    "AttributeError": "У этого объекта нет такого метода или поля. Проверь название.",
    "ModuleNotFoundError": "Этой библиотеки нет в браузерном Python. Такой код запускай на компьютере или в Colab.",
    "FileNotFoundError": "Такого файла нет. В браузере есть только poem.txt из урока, свои данные открывай на компьютере.",
}


def lesson_reset(key):
    _spaces.pop(key, None)


def _prepare_matplotlib():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.show = lambda *args, **kwargs: None


def _describe(error, line):
    name = type(error).__name__
    message = error.msg if isinstance(error, SyntaxError) else str(error)
    text = "%s: %s" % (name, message) if message else name
    if line:
        text = "Строка %d. %s" % (line, text)
    hint = _HINTS.get(name)
    if hint is None:
        for base in type(error).__mro__:
            if base.__name__ in _HINTS:
                hint = _HINTS[base.__name__]
                break
    return {"text": text, "hint": hint}


def _collect_figures():
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return []
    images = []
    for number in plt.get_fignums():
        figure = plt.figure(number)
        data = io.BytesIO()
        figure.savefig(data, format="png", dpi=100, bbox_inches="tight")
        images.append(base64.b64encode(data.getvalue()).decode("ascii"))
    plt.close("all")
    return images


def lesson_run(code, key):
    namespace = _spaces.setdefault(key, {"__name__": "__main__"})
    if "matplotlib" in code:
        _prepare_matplotlib()

    buffer = io.StringIO()
    logging = sys.modules.get("logging")
    if logging is not None:
        # Handlers created in an earlier run still point to that run's buffer.
        for handler in logging.root.handlers:
            if isinstance(handler, logging.StreamHandler) and isinstance(handler.stream, io.StringIO):
                handler.setStream(buffer)

    error = None
    with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
        try:
            exec(compile(code, "<lesson>", "exec"), namespace)
        except SyntaxError as e:
            error = _describe(e, e.lineno)
        except BaseException as e:  # noqa: BLE001 - show any error to the learner
            line = None
            for frame in traceback.extract_tb(e.__traceback__):
                if frame.filename == "<lesson>":
                    line = frame.lineno
            error = _describe(e, line)

    return json.dumps(
        {"out": buffer.getvalue(), "error": error, "images": _collect_figures()},
        ensure_ascii=False,
    )
