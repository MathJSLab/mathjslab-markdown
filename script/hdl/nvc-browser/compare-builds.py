"""Compare candidate artifacts from two separately prepared build directories.

This does not certify their source inputs or change the publication lock.
Run the complete build.sh in each new directory before invoking this command.
"""
from pathlib import Path
import hashlib
import json
import sys

if len(sys.argv) != 3:
    raise SystemExit("Usage: compare-builds.py <first-build-root> <second-build-root>")
roots = [Path(value).resolve() for value in sys.argv[1:]]
if roots[0] == roots[1]:
    raise SystemExit("Use two independent build directories")
results = {}
for name in ("nvc.mjs", "nvc.wasm", "libraries.tar.gz"):
    artifacts = [(root / "build" / "browser" / name).read_bytes() for root in roots]
    results[name] = {
        "equal": artifacts[0] == artifacts[1],
        "sha256": [hashlib.sha256(data).hexdigest() for data in artifacts],
        "bytes": [len(data) for data in artifacts],
    }
print(json.dumps({"roots": [str(root) for root in roots], "artifacts": results}, indent=2))
if not all(result["equal"] for result in results.values()):
    raise SystemExit(1)
