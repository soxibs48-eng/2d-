import os

gd_files = []
for root, dirs, files in os.walk('scripts'):
    for f in files:
        if f.endswith('.gd'):
            gd_files.append(os.path.join(root, f))

print(f"Found {len(gd_files)} GDScript files:")
for f in sorted(gd_files):
    with open(f, 'r', encoding='utf-8') as fp:
        lines = fp.readlines()
    print(f" - {f}: {len(lines)} lines")
