import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createEducationalMarkdownEngine } from '../../src/markdown/createEducationalMarkdownEngine.js';
import { crossReferencesExtension } from '../../src/markdown/extensions/cross-references/extension.js';
import { auditExampleReferences, exampleFiles } from '../examples/reference-audit.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const chapter = path.join(root, 'example/digital-electronics/pt/introduction-to-digital-electronics.md');
const engine = createEducationalMarkdownEngine({ features: 'all' });
const references = crossReferencesExtension();
const audit = (source: string) => auditExampleReferences(source, engine, references, document, 'pt-BR');

afterAll(async () => engine.dispose());

test('the real distributed catalogue has valid document-scoped references before and after formatting', async () => {
  const failures = [];
  const inventory = [];
  const files = exampleFiles(path.join(root, 'example'));
  expect(files).toContain(chapter);
  const formatter = spawnSync(process.execPath, ['test/examples/format-catalog.mjs'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  expect(formatter.status).toBe(0);
  const formattedFiles = JSON.parse(formatter.stdout) as Record<string, string>;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const before = audit(source);
    const formatted = formattedFiles[file]!;
    if (formatted !== source.replaceAll('\r\n', '\n')) failures.push(`${path.relative(root, file)}: catalogue is not formatter-stable`);
    const after = audit(formatted);
    inventory.push({ file: path.relative(root, file), targets: before.metadata.targets.length, references: before.metadata.references.length });
    for (const issue of [...before.issues, ...after.issues]) failures.push(`${path.relative(root, file)}: ${issue}`);
    if (JSON.stringify(before.metadata) !== JSON.stringify(after.metadata)) failures.push(`${path.relative(root, file)}: formatter changed reference metadata`);
  }
  expect(failures).toEqual([]);
  fs.mkdirSync(path.join(root, 'report'), { recursive: true });
  fs.writeFileSync(path.join(root, 'report/example-reference-catalog.json'), JSON.stringify({ files: inventory, failures }, null, 2));
}, 120_000);

test('the chapter registers all current figures and the previously wrapped exercise', () => {
  const result = audit(fs.readFileSync(chapter, 'utf8'));
  expect(result.issues).toEqual([]);
  expect(result.metadata.targets.filter((target) => target.kind === 'figure')).toHaveLength(10);
  expect(result.metadata.targets.some((target) => target.label === 'ex-combinational-or-sequential')).toBe(true);
});

test('the catalogue guard detects missing/duplicate targets and formatter-style corruption in real chapter text', () => {
  const source = fs.readFileSync(chapter, 'utf8');
  expect(audit(source + '\n\n{@ref missing-catalog-target}').issues.join('\n')).toContain('cross-reference-missing');
  expect(audit(source + '\n\n::: figure Duplicate {#fig-digitization-flow}\n\nBody.\n\n:::\n').issues.join('\n')).toContain('cross-reference-duplicate');
  expect(audit(source.replace('grandeza analógica {#fig-digitization-flow}', 'grandeza analógica\n{#fig-digitization-flow}')).issues.join('\n')).toContain('Displaced label');
  expect(audit(source.replace('{@ref fig-digitization-flow}', '{@ref\nfig-digitization-flow}')).issues.join('\n')).toContain('Split or invalid reference');
  const literal = source + '\n\n`{@ref missing-code-target}`\n\n```markdown\n::: figure Literal\n{#not-metadata}\n{@ref\nmissing-code-target}\n:::\n```\n';
  expect(audit(literal).issues).toEqual([]);
});
