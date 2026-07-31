import pathlib, re
base = pathlib.Path('chamber')
html_files = list(base.glob('*.html'))
js_files = list(base.glob('scripts/*.js'))
css_files = [base / 'styles' / f for f in ['styles.css', 'small.css', 'larger.css']]
text = ''
for p in html_files + js_files:
    text += p.read_text('utf-8') + '\n'
class_vals = re.findall(r'class=["\']([^"\']+)["\']', text)
classnames = set(sum((v.split() for v in class_vals), []))
ids = set(re.findall(r'id=["\']([^"\']+)["\']', text))
for p in js_files:
    js_txt = p.read_text('utf-8')
    class_vals += re.findall(r'querySelector(?:All)?\(["\']\.([a-zA-Z0-9_-]+)["\']\)', js_txt)
    class_vals += re.findall(r'getElementsByClassName\(["\']([^"\']+)["\']\)', js_txt)
    class_vals += re.findall(r'classList\.add\(["\']([^"\']+)["\']\)', js_txt)
    class_vals += re.findall(r'classList\.remove\(["\']([^"\']+)["\']\)', js_txt)
    ids |= set(re.findall(r'getElementById\(["\']([^"\']+)["\']\)', js_txt))
classnames = set(sum((v.split() for v in class_vals), []))
print('found classes', len(classnames), sorted(classnames)[:200])
print('found ids', len(ids), sorted(ids))

def parse_css(path):
    text = path.read_text('utf-8')
    rules = []
    for m in re.finditer(r'([^{}]+){([^{}]*)}', text, re.S):
        sel = m.group(1).strip()
        decls = [d.strip() for d in m.group(2).split(';') if d.strip()]
        rules.append((sel, decls))
    return rules

for path in css_files:
    rules = parse_css(path)
    total_selectors = sum(len([s.strip() for s in sel.split(',') if s.strip()]) for sel, decls in rules)
    total_rules = len(rules)
    total_decls = sum(len(decls) for sel, decls in rules)
    print(path.name, 'selectors=', total_selectors, 'rules=', total_rules, 'decls=', total_decls)
    unused = []
    for sel, decls in rules:
        parts = [s.strip() for s in sel.split(',') if s.strip()]
        for part in parts:
            if part.startswith('.'):
                key = re.split(r'[:\.\s>+~]', part[1:])[0]
                if key and key not in classnames:
                    unused.append(part)
            elif part.startswith('#'):
                key = re.split(r'[:\.\s>+~]', part[1:])[0]
                if key and key not in ids:
                    unused.append(part)
    print(' unused count', len(unused), 'sample', unused[:60])
    decl_map = {}
    for sel, decls in rules:
        norm = tuple(sorted([re.sub(r'\s+', ' ', d) for d in decls]))
        decl_map.setdefault(norm, []).append(sel)
    dups = [(norm, sels) for norm, sels in decl_map.items() if len(sels) > 1]
    print(' duplicate blocks', len(dups))
    for norm, sels in dups[:20]:
        print('  dup', len(sels), sels)
    print('---')
