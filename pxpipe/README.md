 pxpipe (vendored, trimmed)

This is **not** the full [pxpipe](https://github.com/teamchong/pxpipe) project — it's a
trimmed-down copy of just `src/core/`, the pure, browser-safe text-to-PNG renderer that
`save-tokens` imports (via `dist/core/library.js`, see `../src/core/renderer/pxpipe/`).

Upstream pxpipe is a local proxy for Claude Code with a CLI, a Cloudflare Worker, a dashboard,
and its own eval/test suites — none of that is needed here, so it isn't vendored. If you need
the full tool, get it from the link above.

## Build

```bash
npm install
npm run build
```

Emits `dist/core/*.js` + type declarations. `dist/` isn't committed — build it before running
the app (see the root `README.md`).

## Updating this vendor copy

To pull in an upstream change, copy the updated `src/core/` tree from the real pxpipe repo
over this one, keep `package.json`/`tsconfig.json`/`scripts/build.mjs` as they are here, and
rebuild.
