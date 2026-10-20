"""Pack GHDL libraries with deterministic, order-preserving analysis metadata.

GHDL compares analysis timestamps across libraries when checking obsolete
dependencies. Do not erase them or replace every timestamp with one constant:
map distinct values within each language edition to increasing milliseconds.
Different editions have separate standard libraries and cannot be mixed.
Checksums, source positions, unit dates, sources and executable code are kept.
"""
from datetime import datetime, timedelta
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import tarfile

HEADER = re.compile(rb'(?m)^(file .+ "[0-9a-f]{40}" ")([0-9]{14}\.[0-9]{3})(":)$')
# GHDL's implicit std.standard has analysis timestamp 20020601000000.000
# (vhdl-std_package.adb, pinned GHDL). All packaged units must remain newer.
EPOCH = datetime(2010, 1, 1)


def edition(name):
    parent = Path(name).parent.name
    return parent if parent in ("v87", "v93", "v08") else "all"


def normalize_catalogs(catalogs):
    stamps = set()
    for name, data in catalogs.items():
        if not data.startswith(b"v 4\n"):
            raise ValueError(f"Unsupported GHDL catalog version: {name}")
        headers = HEADER.findall(data)
        if not headers or len(headers) != sum(line.startswith(b"file ") for line in data.splitlines()):
            raise ValueError(f"Unsupported GHDL file record: {name}")
        for _, stamp, _ in headers:
            datetime.strptime(stamp.decode("ascii"), "%Y%m%d%H%M%S.%f")
            stamps.add((edition(name), stamp))
    mapping = {
        (group, stamp): (EPOCH + timedelta(milliseconds=rank)).strftime("%Y%m%d%H%M%S.%f")[:-3].encode("ascii")
        for group in sorted({group for group, _ in stamps})
        for rank, stamp in enumerate(sorted(stamp for item_group, stamp in stamps if item_group == group))
    }
    return {
        name: HEADER.sub(lambda match: match[1] + mapping[(edition(name), match[2])] + match[3], data)
        for name, data in catalogs.items()
    }, mapping


def pack(root, destination):
    root = Path(root)
    entries = sorted(root.rglob("*"))
    if any(path.is_symlink() for path in entries):
        raise ValueError("Unexpected symlink in GHDL library tree")
    catalogs = {path.relative_to(root).as_posix(): path.read_bytes() for path in entries if path.suffix == ".cf"}
    if not catalogs:
        raise ValueError("No GHDL catalogs found")
    normalized, mapping = normalize_catalogs(catalogs)
    with Path(destination).open("wb") as target:
        with gzip.GzipFile(filename="", mode="wb", fileobj=target, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w", format=tarfile.USTAR_FORMAT) as archive:
                for path in entries:
                    name = path.relative_to(root).as_posix()
                    item = tarfile.TarInfo(name)
                    item.mode = 0o755 if path.is_dir() or path.stat().st_mode & 0o111 else 0o644
                    if path.is_dir():
                        item.type = tarfile.DIRTYPE
                        archive.addfile(item)
                    elif path.is_file():
                        data = normalized.get(name, path.read_bytes())
                        item.size = len(data)
                        archive.addfile(item, io.BytesIO(data))
                    else:
                        raise ValueError(f"Unexpected library entry: {path}")
    report = {
        "method": "Chronological rank per language edition mapped to milliseconds since 2010-01-01; strict order and equality preserved within each edition, newer than implicit std.standard (2002-06-01)",
        "distinctAnalysisTimestamps": len(mapping),
        "catalogs": {name: {"originalSHA256": hashlib.sha256(catalogs[name]).hexdigest(),
                            "normalizedSHA256": hashlib.sha256(data).hexdigest()}
                     for name, data in normalized.items()},
    }
    Path(destination).with_name("library-metadata.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf8")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: pack-libraries.py <GHDL library directory> <libraries.tar.gz>")
    pack(*sys.argv[1:])
