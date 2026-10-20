"""Compare all six candidate artifacts; never replace distributed assets."""
from pathlib import Path
import hashlib
import json
import sys

first, second = (Path(arg).resolve() for arg in sys.argv[1:3])
artifacts = {}
for tool in ['ivlpp', 'ivl', 'vvp']:
    for extension in ['js', 'wasm']:
        name = tool + '.' + extension
        a, b = ((root / name).read_bytes() for root in [first, second])
        if a != b:
            raise SystemExit('Different artifact: ' + name)
        artifacts[name] = {'bytes': len(a), 'sha256': hashlib.sha256(a).hexdigest()}
print(json.dumps(artifacts, indent=2))
