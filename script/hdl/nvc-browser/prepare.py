"""Verify and unpack the complete archived sources; does not download tools."""
from pathlib import Path
import hashlib
import json
import sys
import tarfile

here = Path(__file__).resolve().parent
target = Path(sys.argv[1]).resolve()
if target.exists() and any(target.iterdir()):
    raise SystemExit("Choose a new empty build directory; existing files are preserved")
target.mkdir(parents=True, exist_ok=True)
lock = json.loads((here / "sources.lock.json").read_text(encoding="utf-8"))
for name, expected in lock["downloadsSHA256"].items():
    archive = here / "sources" / name
    assert hashlib.sha256(archive.read_bytes()).hexdigest() == expected, name
    with tarfile.open(archive) as source:
        source.extractall(target, filter="data")
print("Verified and unpacked four pinned source archives")
