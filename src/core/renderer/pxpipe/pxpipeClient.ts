// A plain relative import into the vendored pxpipe repo's built output, not the npm package
// name — npm's `file:` protocol installs a locally-linked package's devDependencies
// (wrangler, workerd, and the rest of its Cloudflare Workers tooling) into this project's
// own install, which a browser app has no business dragging in. A relative path sidesteps
// npm dependency resolution entirely and (unlike a bundler alias for the bare specifier)
// resolves identically in the dev server, `vite build`, and Vitest with zero extra config.
import { renderTextToImages, type RenderTextToImagesResult } from '../../../../pxpipe/dist/core/library.js'

/**
 * `maxHeightPx` mirrors pxpipe's own `GPT_MAX_HEIGHT_PX` (its tallest built-in page height —
 * see pxpipe/src/core/gpt-model-profiles.ts) rather than the smaller 728px default, so a
 * generation has more vertical budget before pxpipe has to split it into extra pages.
 * `maxCharsPerImage` is raised to match. `reflow: true` is what actually makes a bigger
 * budget usable in practice: without it, short hard-wrapped lines (code, logs — anything
 * that isn't one long flowing paragraph) each waste most of a row's width, so the same
 * character budget that fits one page of prose can explode into a dozen pages of code.
 * `reflow` packs short lines into full-width rows (joined with a `↵` sentinel so the text
 * stays fully reconstructable) — see MAX_CHARACTERS in constants.ts for the measured,
 * content-shape-independent safe ceiling this combination actually produces.
 */
const MAX_HEIGHT_PX = 1932
const MAX_CHARS_PER_IMAGE = 48000

/**
 * The only file that imports pxpipe. Deliberately reached only from the adapter (which in
 * turn is only reached from the render worker) — pxpipe's module graph is large, so keeping
 * every import of it inside the worker's own bundle keeps it out of the main thread chunk.
 */
export function renderWithPxpipe(text: string): Promise<RenderTextToImagesResult> {
  return renderTextToImages(text, {
    reflow: true,
    maxHeightPx: MAX_HEIGHT_PX,
    maxCharsPerImage: MAX_CHARS_PER_IMAGE,
  })
}
