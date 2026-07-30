/** ~6 characters per word ÷ ~1.333 tokens per word (1 token ≈ 0.75 words). */
export const CHARS_PER_TOKEN = 4.5
export const DEFAULT_PATCH_SIZE = 32

export function estimateTextTokens(characterCount: number): number {
  return Math.ceil(characterCount / CHARS_PER_TOKEN)
}

export function patchCount(sizePx: number, patchSize = DEFAULT_PATCH_SIZE): number {
  return Math.ceil(sizePx / patchSize)
}

/** GPT-5.6 `original`/`auto` patch calculation: ceil(w/32) × ceil(h/32). */
export function estimateVisionTokens(width: number, height: number, patchSize = DEFAULT_PATCH_SIZE): number {
  return patchCount(width, patchSize) * patchCount(height, patchSize)
}

export interface CompressionEstimate {
  textTokens: number
  visionTokens: number
  /** How many text-tokens each vision-token replaces. */
  compressionRatio: number
  /** Percentage of tokens saved by using the image instead of raw text. Negative means the image costs more. */
  percentSaved: number
}

export function estimateCompression(
  characterCount: number,
  imageWidth: number,
  imageHeight: number,
  patchSize = DEFAULT_PATCH_SIZE,
): CompressionEstimate {
  const textTokens = estimateTextTokens(characterCount)
  const visionTokens = estimateVisionTokens(imageWidth, imageHeight, patchSize)
  const compressionRatio = visionTokens === 0 ? 0 : textTokens / visionTokens
  const percentSaved = textTokens === 0 ? 0 : ((textTokens - visionTokens) / textTokens) * 100

  return { textTokens, visionTokens, compressionRatio, percentSaved }
}
