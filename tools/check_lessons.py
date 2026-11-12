"""Запускает весь код из уроков и сверяет вывод с тем, что показано в приложении.

Использование:  python tools/check_lessons.py
Нужны: node, Python с numpy, pandas, matplotlib, scikit-learn.
Блоки с lang ("terminal", "text", "file") и skip: true (нужен интернет) пропускаются.
"""
import contextlib
import io
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ["data.js", "lessons-p1-extra.js", "lessons-p2.js", "lessons-p3.js"]
SHELL_WORDS = ("git ", "python ", "pip ", "cd ", ".venv", "source ", "docker ", "pytest", "fastapi ", "ruff ")

node_src = "global.window = {};" + "".join(
    "require(%s);" % json.dumps(os.path.join(ROOT, f)) for f in FILES
) + "console.log(JSON.stringify(window.PATH));"
path = json.loads(subprocess.check_output(["node", "-e", node_src], text=True))

os.environ["MPLBACKEND"] = "Agg"
work = tempfile.mkdtemp()
os.chdir(work)
with open("poem.txt", "w", encoding="utf-8") as f:
    f.write("The night is dark,\nand the moon is bright!\n")


def run(code, ns):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(compile(code, "<lesson>", "exec"), ns)
    return buf.getvalue()


def is_shell(code):
    for line in code.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line.startswith(SHELL_WORDS)
    return False


ran = checked = failed = skipped = 0
for project in path["projects"]:
    ns = {}
    for lesson in project.get("theory", []):
        where = "%s / %s" % (project["id"], lesson["title"])
        for sec in lesson["sections"]:
            code = sec.get("code")
            if not code:
                continue
            if sec.get("lang") or sec.get("skip"):
                skipped += 1
                continue
            try:
                got = run(code, ns)
            except Exception as e:  # noqa: BLE001
                failed += 1
                print("ОШИБКА  %s / %s: %r" % (where, sec["h"], e))
                continue
            ran += 1
            if "out" in sec:
                checked += 1
                if got.rstrip() != sec["out"].rstrip():
                    failed += 1
                    print("НЕ СОВПАЛО  %s / %s\n--- в уроке:\n%s\n--- на деле:\n%s" % (where, sec["h"], sec["out"], got))
        for i, task in enumerate(lesson.get("practice", []), 1):
            code = task["solution"]
            if task.get("lang") or is_shell(code):
                skipped += 1
                continue
            try:
                got = run(code, dict(ns))
            except Exception as e:  # noqa: BLE001
                failed += 1
                print("ОШИБКА  %s / задание %d: %r" % (where, i, e))
                continue
            ran += 1
            # в решениях ожидаемый вывод записан комментариями: сверяем числа
            expected = [l[2:].strip() for l in code.splitlines() if l.startswith("# ")]
            first = got.strip().splitlines()[0] if got.strip() else ""
            if first and expected and not any(first == e or first in e for e in expected):
                print("ПРОВЕРЬ  %s / задание %d: вывод %r, в комментарии %r" % (where, i, first, expected[0]))

print("Запущено блоков: %d, сверено с выводом: %d, пропущено: %d, расхождений: %d" % (ran, checked, skipped, failed))
sys.exit(1 if failed else 0)
