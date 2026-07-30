import type { LayoutPlan } from '@/core/layout'
import type { OcrQualityResult } from '@/core/ocr/ocrQuality'

export interface PageReport {
  index: number
  characters: number
  width: number
  height: number
  unusedCells: number
  occupancyPercent: number
}

export interface ReportData {
  generatedAt: string
  characters: number
  words: number
  textTokens: number
  visionTokens: number
  compressionRatio: number
  percentSaved: number
  pageCount: number
  ocr: OcrQualityResult
  pages: PageReport[]
}

export function buildReportData(plan: LayoutPlan, ocr: OcrQualityResult): ReportData {
  return {
    generatedAt: new Date().toISOString(),
    characters: plan.metrics.characterCount,
    words: plan.metrics.wordCount,
    textTokens: plan.compression.textTokens,
    visionTokens: plan.compression.visionTokens,
    compressionRatio: plan.compression.compressionRatio,
    percentSaved: plan.compression.percentSaved,
    pageCount: plan.pageCount,
    ocr,
    pages: plan.pages.map((page) => ({
      index: page.index,
      characters: page.characterCount,
      width: page.canvasWidth,
      height: page.canvasHeight,
      unusedCells: page.unusedCells,
      occupancyPercent: page.occupancy * 100,
    })),
  }
}

export function reportToJson(report: ReportData): string {
  return JSON.stringify(report, null, 2)
}

export function reportToMarkdown(report: ReportData): string {
  const lines: string[] = []
  lines.push('# Text → Image Compression Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|---|---:|')
  lines.push(`| Characters | ${report.characters.toLocaleString()} |`)
  lines.push(`| Words | ${Math.round(report.words).toLocaleString()} |`)
  lines.push(`| Text tokens | ${report.textTokens.toLocaleString()} |`)
  lines.push(`| Vision tokens | ${report.visionTokens.toLocaleString()} |`)
  lines.push(`| Compression ratio | ${report.compressionRatio.toFixed(2)}x |`)
  lines.push(`| Percent saved | ${report.percentSaved.toFixed(1)}% |`)
  lines.push(`| Pages | ${report.pageCount} |`)
  lines.push(`| OCR quality | ${report.ocr.label} (${report.ocr.score}/100) |`)
  lines.push('')
  lines.push('## Pages')
  lines.push('')
  lines.push('| Page | Characters | Resolution | Unused cells | Occupancy |')
  lines.push('|---:|---:|---|---:|---:|')
  for (const page of report.pages) {
    lines.push(
      `| ${page.index + 1} | ${page.characters.toLocaleString()} | ${page.width} × ${page.height} | ${page.unusedCells} | ${page.occupancyPercent.toFixed(1)}% |`,
    )
  }
  lines.push('')
  lines.push('## OCR Notes')
  lines.push('')
  for (const reason of report.ocr.reasons) {
    lines.push(`- ${reason}`)
  }
  lines.push('')

  return lines.join('\n')
}
