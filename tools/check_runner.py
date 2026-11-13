"""Runs every example that gets a "Run" button through runner.py, the same way the app does.

Checks that outputs match the lessons and that exercise solutions run without errors.
Usage: python tools/check_runner.py
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ["data.js", "lessons-p1-extra.js", "lessons-p2.js", "lessons-p3.js", "lessons-p4.js", "lessons-p5.js", "lessons-p6.js"]
SHELL_WORDS = ("git ", "python ", "pip ", "cd ", ".venv", "source ", "docker ", "pytest", "fastapi ", "ruff ")

node_src = "global.window = {};" + "".join(
    "require(%s);" % json.dumps(os.path.join(ROOT, f)) for f in FILES
) + "console.log(JSON.stringify(window.PATH));"
path = json.loads(subprocess.check_output(["node", "-e", node_src], text=True))

os.chdir(tempfile.mkdtemp())
runner = {}
exec(open(os.path.join(ROOT, "runner.py"), encoding="utf-8").read(), runner)


def first_line(code):
    for line in code.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    return ""


def practice_runnable(task):
    if task.get("lang"):
        return False
    first = first_line(task["solution"])
    return bool(first) and not first.startswith(SHELL_WORDS)


blocks = matched = images = practice = failed = 0
for project in path["projects"]:
    key = project["id"]
    for lesson in project.get("theory", []):
        for sec in lesson["sections"]:
            if not sec.get("code") or sec.get("lang") or sec.get("skip"):
                continue
            blocks += 1
            r = json.loads(runner["lesson_run"](sec["code"], key))
            images += len(r["images"])
            if r["error"]:
                failed += 1
                print("ОШИБКА  %s / %s: %s" % (key, sec["h"], r["error"]["text"]))
            elif "out" in sec:
                if r["out"].rstrip() == sec["out"].rstrip():
                    matched += 1
                else:
                    failed += 1
                    print("НЕ СОВПАЛО  %s / %s\n%s\n---\n%s" % (key, sec["h"], sec["out"], r["out"]))
        for i, task in enumerate(lesson.get("practice", []), 1):
            if not practice_runnable(task):
                continue
            practice += 1
            r = json.loads(runner["lesson_run"](task["solution"], key))
            if r["error"]:
                failed += 1
                print("ОШИБКА  %s / %s / задание %d: %s" % (key, lesson["title"], i, r["error"]["text"]))

# Сообщения об ошибках для ученика
for code in ["print(undefined_name)", "for i in range(3)\n    print(i)", "import torch", "1/0"]:
    r = json.loads(runner["lesson_run"](code, "errors"))
    print("ПРИМЕР ОШИБКИ:", r["error"]["text"], "|", r["error"]["hint"][:60])

print("Блоков с кнопкой: %d, вывод совпал: %d, графиков: %d, упражнений с проверкой: %d, проблем: %d"
      % (blocks, matched, images, practice, failed))
sys.exit(1 if failed else 0)
