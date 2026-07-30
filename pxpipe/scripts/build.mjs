// Emit dist/core/*.js + .d.ts with tsc. Upstream pxpipe also bundles a CLI
// (src/node.ts) and a Worker entry here — this vendored copy only ships
// src/core/, the browser-safe renderer this app actually imports, so that
// bundling/smoke-check step doesn't apply.
import { rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const OUT = 'dist';
if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const tscBin = require.resolve('typescript/bin/tsc');
const tsc = spawnSync(process.execPath, [tscBin, '-p', 'tsconfig.json'], {
  stdio: 'inherit',
});
if (tsc.error) {
  console.error(`✗ failed to run tsc: ${tsc.error.message}`);
  process.exit(1);
}
if (tsc.status !== 0) process.exit(tsc.status ?? 1);
console.log('✓ emitted dist/core/*.js + .d.ts');
