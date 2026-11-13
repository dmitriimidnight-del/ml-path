"""Checks that every file the app loads is in the service worker's offline list (sw.js)."""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
sw = open(os.path.join(ROOT, "sw.js"), encoding="utf-8").read()

needed = set(re.findall(r'(?:src|href)="([^"#:]+)"', html)) | {"runner.py", "index.html", "./"}
listed = set(re.findall(r'^\s+"([^"]+)",?$', sw.split("SHELL_FILES = [")[1].split("];")[0], re.M))
missing = sorted(needed - listed)
absent = sorted(f for f in listed - {"./"} if not os.path.exists(os.path.join(ROOT, f)))
print("Не сохраняются для офлайна:", missing or "нет")
print("Указаны, но не существуют:", absent or "нет")
sys.exit(1 if missing or absent else 0)
