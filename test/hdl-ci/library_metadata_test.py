import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("pack", Path(__file__).resolve().parents[2] / "script/hdl/ghdl-synth/pack-libraries.py")
packer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packer)


def catalog(stamps):
    return b"v 4\n" + b"".join(
        b'file . "unit' + str(i).encode() + b'.vhdl" "' + b"a" * 40 + b'" "' + stamp + b'":\n  package test at 1( 0) + 0 on 11;\n'
        for i, stamp in enumerate(stamps)
    )


class MetadataTests(unittest.TestCase):
    def test_preserves_cross_catalog_order_and_equalities(self):
        a, b, c = b"20261020120000.001", b"20261020120000.007", b"20261020120001.000"
        original = {"std.cf": catalog([a, b]), "ieee.cf": catalog([b, c])}
        normalized, mapping = packer.normalize_catalogs(original)
        self.assertLess(mapping[("all", a)], mapping[("all", b)])
        self.assertLess(mapping[("all", b)], mapping[("all", c)])
        self.assertGreater(mapping[("all", a)], b"20020601000000.000")
        for name, data in original.items():
            def without_times(value):
                return packer.HEADER.sub(lambda m: m[1] + b"TIME" + m[3], value)
            self.assertEqual(without_times(data), without_times(normalized[name]))

    def test_different_wall_clocks_produce_identical_archives(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            results = []
            for i, stamps in enumerate([
                [b"20261020120000.001", b"20261020120001.000"],
                [b"20261021153003.123", b"20261021153009.999"],
            ]):
                source = root / str(i)
                source.mkdir()
                raw = catalog(stamps)
                (source / "ieee.cf").write_bytes(raw)
                (source / "source.vhdl").write_bytes(b"unchanged source\n")
                output = root / f"result{i}.tar.gz"
                packer.pack(source, output)
                results.append(output.read_bytes())
                self.assertEqual((source / "ieee.cf").read_bytes(), raw)
            self.assertEqual(*results)

    def test_rejects_unrecognized_catalog_instead_of_silently_skipping(self):
        for data in [b"v 5\n", b"v 4\nfile unsupported\n"]:
            with self.assertRaises(ValueError):
                packer.normalize_catalogs({"ieee.cf": data})

    def test_independent_language_editions_do_not_affect_each_other(self):
        a, b = b"20261020120000.001", b"20261020120001.000"
        first, _ = packer.normalize_catalogs({"std/v08/std.cf": catalog([a]), "std/v93/std.cf": catalog([b])})
        second, _ = packer.normalize_catalogs({"std/v08/std.cf": catalog([b]), "std/v93/std.cf": catalog([a])})
        self.assertEqual(first, second)


if __name__ == "__main__":
    unittest.main()
