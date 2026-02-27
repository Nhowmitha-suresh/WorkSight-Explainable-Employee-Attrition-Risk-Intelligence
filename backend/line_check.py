import pathlib
path=pathlib.Path('main.py')
lines = path.read_text().splitlines()
for i,l in enumerate(lines,1):
    if i <= 20:
        print(f"{i}: {l}")
    if 'add_middleware' in l:
        print('found add_middleware at line',i,repr(l))
