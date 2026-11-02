# Dependency audit — 0.10.0

The release uses mathjslab 2.10.0 from npm, both as an optional peer and a
matching development dependency. Runtime renderer updates include marked
18.1.3, Three.js/@types 0.187.0 and Verovio 6.4.0. Build tools include ESLint
10.14.0, globals 17.14.0, minimizer-webpack-plugin 5.14.0, webpack-cli 7.3.1
and @types/node 26.6.6. The locked installation is the release input.

## Audit on 2026-11-02

`npm audit --omit=dev --json` reports **zero vulnerabilities** for the
production/optional dependency graph. The complete audit reports **30**
findings: 4 low and 26 moderate, all in development tooling. These counts
include parent packages affected transitively; they do not mean 30 independent
bugs.

Three advisory roots account for these findings:

- [glob cancellation bypass](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)
  affects filesystem traversal when AbortSignal cancellation is relied on.
  Installed through Jest/coverage tools; the patched major is 14.0.2 or newer.
- [minimatch pattern amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249)
  affects crafted glob patterns and can cause denial of service. Installed by
  ESLint, TypeScript ESLint and Jest tooling; the patched major is 11.0.1 or
  newer.
- [deepmerge prototype poisoning](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
  affects merging untrusted objects. Jest configuration uses 4.3.1; no patched
  version is listed in the advisory or available on npm at audit time.

The project supplies its own test/lint patterns and trusted local
configuration; these tools are not shipped in the browser runtime. Keep CI
configuration and patterns trusted. The residual development risks remain
recorded, rather than being treated as resolved. `npm audit fix --force`
currently proposes incompatible Jest/ESLint downgrades and does not provide a
complete compatible correction. No cross-major transitive overrides were added
without upstream compatibility support. Recheck advisories when upstream
toolchains adopt corrected majors.

The complete release gate checks lint/types, unit tests, production bundles,
public declarations, package contents, renderer/browser and HDL behavior. The
security audit supplements those checks; passing tests alone does not resolve
the development advisories. Pinned Wasm compiler/source assets and the private
3Dmol compatibility recipe remain independently version/hash checked.
