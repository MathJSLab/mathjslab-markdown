"""Package actual compiled libraries, never simulation results or fixtures."""
from pathlib import Path
import gzip
import io
import sys
import tarfile

build = Path(sys.argv[1]).resolve()
contents = io.BytesIO()
with tarfile.open(fileobj=contents, mode="w", format=tarfile.USTAR_FORMAT) as archive:
    for group in ["std.08", "ieee.08", "nvc.08"]:
        for source in sorted((build / "lib" / group).iterdir()):
            if source.is_file():
                data = source.read_bytes()
                item = tarfile.TarInfo(group + "/" + source.name)
                item.size, item.mtime, item.mode = len(data), 0, 0o644
                archive.addfile(item, io.BytesIO(data))
(build / "browser" / "libraries.tar.gz").write_bytes(gzip.compress(contents.getvalue(), mtime=0))
