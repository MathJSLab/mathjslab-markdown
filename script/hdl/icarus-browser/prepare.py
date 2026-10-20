"""Verify complete archived sources and bootstrap inputs before extraction."""
import hashlib
import json
from pathlib import Path
import sys
import tarfile

here = Path(__file__).resolve().parent
target = Path(sys.argv[1]).resolve()
if target.exists() and any(target.iterdir()):
    raise SystemExit('Choose a fresh empty directory; existing files are preserved')
lock = json.loads((here / 'sources.lock.json').read_text())
for name, expected in lock['inputsSHA256'].items():
    assert hashlib.sha256((here / name).read_bytes()).hexdigest() == expected, name
zlib = here.parent / 'nvc-browser/sources/zlib-1.3.2.tar.gz'
assert hashlib.sha256(zlib.read_bytes()).hexdigest() == lock['zlib']['archiveSHA256'], 'zlib source'
assert hashlib.sha512(zlib.read_bytes()).hexdigest() == lock['zlib']['emscriptenPortSHA512'], 'SDK zlib port source'
target.mkdir(parents=True, exist_ok=True)
with tarfile.open(here / 'sources/iverilog-c7530db.tar.gz') as archive:
    archive.extractall(target, filter='data')
print('Verified complete Icarus archive, patch and generated bootstrap inputs')
