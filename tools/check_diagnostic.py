"""Runs the code of every diagnostic question and checks that only the marked option matches the real output."""
import contextlib
import io
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = "global.window = {}; require(%s); console.log(JSON.stringify(window.DIAGNOSTIC));" % json.dumps(os.path.join(ROOT, "diagnostic.js"))
diag = json.loads(subprocess.check_output(["node", "-e", src], text=True))

bad = 0
for i, q in enumerate(diag["questions"], 1):
    assert q["topic"] in diag["topics"], q["topic"]
    if "code" not in q:
        continue
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(q["code"], {})
        out = buf.getvalue().strip()
    except Exception as e:  # noqa: BLE001
        out = "Ошибка"
    matching = [n for n, o in enumerate(q["options"]) if o == out]
    ok = matching == [q["answer"]]
    bad += not ok
    print("%2d %-14s %s  вывод: %r" % (i, q["topic"], "OK " if ok else "НЕВЕРНО", out))
print("Вопросов: %d, ошибок: %d" % (len(diag["questions"]), bad))
sys.exit(1 if bad else 0)
