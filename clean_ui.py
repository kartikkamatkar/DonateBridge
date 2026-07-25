import os
import re
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove inline font sizes
    # Matches style={{ fontSize: '12px' }} or style={{ fontSize: '13px', minHeight: '48px' }}
    # We will just remove fontSize entirely. If style becomes empty, remove style too.
    content = re.sub(r"fontSize:\s*'[^']*',?\s*", "", content)
    content = re.sub(r"minHeight:\s*'[^']*',?\s*", "", content)
    # clean up empty style blocks
    content = re.sub(r"style=\{\{\s*\}\}", "", content)
    
    # 2. Convert text-[Xpx]
    def replace_text_px(match):
        px = int(match.group(1))
        if px <= 11:
            return "text-xs"
        elif px <= 14:
            return "text-sm"
        elif px <= 16:
            return "text-base"
        elif px <= 18:
            return "text-lg"
        elif px <= 20:
            return "text-xl"
        elif px <= 24:
            return "text-2xl"
        else:
            return "text-3xl"
            
    content = re.sub(r"text-\[(\d+)px\]", replace_text_px, content)
    
    # 3. Replace arbitrary colors
    replacements = {
        "text-slate-450": "text-slate-500",
        "text-slate-550": "text-slate-500",
        "text-slate-650": "text-slate-600",
        "text-slate-705": "text-slate-700",
        "text-slate-750": "text-slate-700",
        "text-slate-905": "text-slate-900",
        "bg-red-550": "bg-red-500",
        "bg-red-650": "bg-red-600",
        "text-red-650": "text-red-600",
        "border-red-150": "border-red-200",
        "border-emerald-150": "border-emerald-200",
        "border-emerald-250": "border-emerald-300",
        "bg-emerald-150": "bg-emerald-100",
        "text-emerald-650": "text-emerald-600",
        "bg-slate-150": "bg-slate-100",
        "border-slate-150": "border-slate-200",
        "border-slate-250": "border-slate-300",
        "bg-slate-250": "bg-slate-200",
        "bg-slate-350": "bg-slate-300",
        "text-slate-350": "text-slate-400",
        "bg-amber-550": "bg-amber-500",
        "text-amber-750": "text-amber-700",
        "border-amber-150": "border-amber-200",
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Processed {filepath}")

for root, _, files in os.walk('client/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

# Also clean components
for root, _, files in os.walk('client/src/components'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

