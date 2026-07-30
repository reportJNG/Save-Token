export * from './characterMetrics'
export * from './resolution'
export * from './grid'
export * from './tokenEstimator'
export * from './pagination'
export * from './imageGenerator'

import { analyzeText, type CharacterCellConfig } from './characterMetrics'
import { computePagination, type PaginationConfig } from './pagination'
import { buildDrawPlan, type PageDrawPlan, type RenderStyle } from './imageGenerator'
import { estimateTextTokens, estimateVisionTokens, type CompressionEstimate } from './tokenEstimator'

export interface LayoutPlanConfig {
  cell: CharacterCellConfig
  mode: PaginationConfig['mode']
  targetAspect: number
  maxPageWidth: number
  maxPageHeight: number
  style: RenderStyle
}

export interface LayoutPlan {
  text: string
  metrics: ReturnType<typeof analyzeText>
  pageCount: number
  singlePage: boolean
  pages: PageDrawPlan[]
  compression: CompressionEstimate
  totalVisionTokens: number
}

/** Single entry point that runs text through the whole pure pipeline. */
export function generateLayoutPlan(text: string, config: LayoutPlanConfig): LayoutPlan {
  const metrics = analyzeText(text)

  if (metrics.characterCount === 0) {
    return {
      text,
      metrics,
      pageCount: 0,
      singlePage: true,
      pages: [],
      compression: { textTokens: 0, visionTokens: 0, compressionRatio: 0, percentSaved: 0 },
      totalVisionTokens: 0,
    }
  }

  const pagination = computePagination(metrics.characterCount, {
    cell: config.cell,
    mode: config.mode,
    targetAspect: config.targetAspect,
    maxPageWidth: config.maxPageWidth,
    maxPageHeight: config.maxPageHeight,
  })

  const pages = buildDrawPlan(text, pagination.pages, config.cell, config.style)

  const totalVisionTokens = pages.reduce(
    (sum, page) => sum + estimateVisionTokens(page.canvasWidth, page.canvasHeight),
    0,
  )

  const textTokens = estimateTextTokens(metrics.characterCount)
  const compression: CompressionEstimate = {
    textTokens,
    visionTokens: totalVisionTokens,
    compressionRatio: totalVisionTokens === 0 ? 0 : textTokens / totalVisionTokens,
    percentSaved: textTokens === 0 ? 0 : ((textTokens - totalVisionTokens) / textTokens) * 100,
  }

  return {
    text,
    metrics,
    pageCount: pagination.pageCount,
    singlePage: pagination.singlePage,
    pages,
    compression,
    totalVisionTokens,
  }
}
