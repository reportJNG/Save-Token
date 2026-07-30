export type ResolutionCategory = 'A — Large' | 'B — Very large' | 'C — Extreme' | 'D — Split required'

/** Categorizes a single image's largest side against practical single-upload limits. */
export function categoryForSide(maxSide: number): ResolutionCategory {
  if (maxSide <= 4096) return 'A — Large'
  if (maxSide <= 6144) return 'B — Very large'
  if (maxSide <= 8192) return 'C — Extreme'
  return 'D — Split required'
}
