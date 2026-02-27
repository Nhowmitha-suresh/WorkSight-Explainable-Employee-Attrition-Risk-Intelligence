from pathlib import Path
p = Path('main.py')
for i, l in enumerate(p.read_text().splitlines(keepends=True), 1):
    print(i, repr(l))
