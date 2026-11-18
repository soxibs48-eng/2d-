import os
import re

errors = []
res_pattern = re.compile(r'\"res://([^\"]+)\"')

for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith(('.tscn', '.godot')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                matches = res_pattern.findall(content)
                for m in matches:
                    local_p = m.replace('/', os.sep)
                    if not os.path.exists(local_p):
                        errors.append(f'Broken link in {path}: res://{m}')

if errors:
    print('ERRORS FOUND:')
    for e in errors:
        print(e)
else:
    print('SUCCESS: All scene and project resource links are 100% valid!')
