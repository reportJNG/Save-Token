/**
 * The single-page character budget for the render config in pxpipeClient.ts (reflow +
 * raised height/char caps). Empirically measured (see PxpipeRenderer.test.ts and the
 * measurement notes below) rather than derived from a pxpipe constant, because pxpipe's
 * pagination boundary depends on the text's own line-wrapping shape, not just its length —
 * an internal detail its public API doesn't expose a formula for.
 *
 * Measured single-page ceilings at { reflow: true, maxHeightPx: 1932, maxCharsPerImage: 48000 }:
 *   - flowing prose:        ~48,700 chars
 *   - short lines (code):   ~51,400 chars (reflow's whole point — packs them densely)
 *   - one unbroken line:    ~47,700 chars
 *   - CJK / wide scripts:   ~23,900 chars (double-width glyphs cost 2 grid cells each —
 *                           inherent to any monospace-grid renderer, not a pxpipe quirk)
 *
 * 45,000 sits safely under every measured ceiling except pure-CJK text, which the adapter's
 * runtime multi-page guard (`PxpipeRenderer.ts`) still catches and surfaces as a clear error
 * rather than silently dropping content.
 */
export const MAX_CHARACTERS = 45000
